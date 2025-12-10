import { publicProcedure } from '../../../create-context.js';
import { z } from 'zod';
import { db } from '../../../../utils/database.js';

const renewPlanEarlyInput = z.object({
  userId: z.string(),
  planId: z.string(),
});

export const renewPlanEarlyProcedure = publicProcedure
  .input(renewPlanEarlyInput)
  .mutation(async ({ input }) => {
    console.log('[renewPlanEarly] Starting early renewal for user:', input.userId, 'plan:', input.planId);
    
    try {
      const user = await db.users.findById(input.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (!user.dateRenouvellement) {
        throw new Error('No subscription found');
      }
      
      const currentRenewalDate = new Date(user.dateRenouvellement);
      const newRenewalDate = new Date(currentRenewalDate);
      newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
      
      const updatedUser = await db.users.update(input.userId, {
        minutesRemaining: user.minutesIncluded,
        dateRenouvellement: newRenewalDate.toISOString(),
      });
      
      console.log('[renewPlanEarly] Successfully renewed plan early', {
        planId: input.planId,
        minutesRestored: user.minutesIncluded,
        newRenewalDate: newRenewalDate.toISOString(),
      });
      
      return {
        success: true,
        subscription: {
          planId: updatedUser.planId,
          minutesIncluded: updatedUser.minutesIncluded,
          minutesRemaining: updatedUser.minutesRemaining,
          renewalDate: updatedUser.dateRenouvellement,
        },
        message: 'Votre pack a été renouvelé avec succès',
      };
    } catch (error: any) {
      console.error('[renewPlanEarly] Error:', error);
      throw new Error(error.message || 'Impossible de renouveler le pack');
    }
  });

export default renewPlanEarlyProcedure;
