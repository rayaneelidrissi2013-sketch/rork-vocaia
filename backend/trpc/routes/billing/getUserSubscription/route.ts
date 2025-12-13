import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { Pool } from 'pg';

let pool: Pool | null = null;

const getPool = (): Pool => {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL_NOT_CONFIGURED');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  return pool;
};

export default protectedProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    console.log('[tRPC] getUserSubscription called for:', input.userId);
    
    try {
      const db = getPool();
      
      const subscriptionResult = await db.query(
        `SELECT 
          us.plan_id,
          us.minutes_remaining,
          us.renewal_date,
          us.status,
          sp.name as plan_name,
          sp.minutes_included,
          sp.price
         FROM user_subscriptions us
         JOIN subscription_plans sp ON us.plan_id = sp.id
         WHERE us.user_id = $1
         ORDER BY us.created_at DESC
         LIMIT 1`,
        [input.userId]
      );

      if (subscriptionResult.rows.length === 0) {
        console.log('[tRPC] No subscription found for user:', input.userId);
        return null;
      }

      const subscription = subscriptionResult.rows[0];
      const minutesConsumed = subscription.minutes_included - subscription.minutes_remaining;

      return {
        planId: subscription.plan_id,
        planName: subscription.plan_name,
        minutesIncluded: subscription.minutes_included,
        minutesRemaining: subscription.minutes_remaining,
        minutesConsumed: minutesConsumed,
        renewalDate: subscription.renewal_date,
        status: subscription.status,
        price: parseFloat(subscription.price),
      };
    } catch (error: any) {
      console.error('[tRPC] Error fetching user subscription:', error);
      throw error;
    }
  });