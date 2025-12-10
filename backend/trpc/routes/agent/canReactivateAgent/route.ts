import { protectedProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { db } from '@/backend/utils/database';

export default protectedProcedure
  .input(z.object({
    userId: z.string(),
    newPlanId: z.string(),
  }))
  .query(async ({ input }) => {
    console.log('[tRPC] canReactivateAgent called for user:', input.userId, 'new plan:', input.newPlanId);
    
    try {
      const user = await db.users.findById(input.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.minutesRemaining > 0) {
        return {
          canReactivate: true,
          reason: 'MINUTES_AVAILABLE',
        };
      }
      
      if (!input.newPlanId) {
        return {
          canReactivate: false,
          reason: 'NO_PLAN_SELECTED',
        };
      }
      
      if (user.planId === input.newPlanId) {
        return {
          canReactivate: false,
          reason: 'SAME_PLAN',
        };
      }
      
      return {
        canReactivate: true,
        reason: 'UPGRADE_AVAILABLE',
      };
    } catch (error) {
      console.error('[tRPC] Error checking reactivation eligibility:', error);
      throw error;
    }
  });
