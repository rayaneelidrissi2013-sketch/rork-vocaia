import { protectedProcedure } from '@/backend/trpc/create-context';
import { db } from '@/backend/utils/database';

export default protectedProcedure
  .mutation(async () => {
    console.log('[tRPC] renewSubscriptions: Starting monthly renewal process');
    
    try {
      const users = await db.users.getAll();
      const now = new Date();
      let renewedCount = 0;
      
      for (const user of users) {
        if (!user.dateRenouvellement || !user.planId) {
          continue;
        }
        
        const renewalDate = new Date(user.dateRenouvellement);
        
        if (renewalDate <= now) {
          console.log(`[tRPC] Renewing subscription for user ${user.id}`);
          
          await db.users.update(user.id, {
            minutesRemaining: user.minutesIncluded,
            minutesConsumed: 0,
            dateRenouvellement: new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              renewalDate.getDate()
            ).toISOString(),
          });
          
          renewedCount++;
        }
      }
      
      console.log(`[tRPC] Renewed ${renewedCount} subscriptions`);
      
      return {
        success: true,
        renewedCount,
      };
    } catch (error) {
      console.error('[tRPC] Error renewing subscriptions:', error);
      throw new Error('Failed to renew subscriptions');
    }
  });
