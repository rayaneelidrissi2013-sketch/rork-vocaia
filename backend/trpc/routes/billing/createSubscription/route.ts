import { protectedProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { createSubscription } from '@/backend/utils/paypal';
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
  .input(z.object({
    planId: z.string(),
    userId: z.string(),
    returnUrl: z.string(),
    cancelUrl: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[tRPC] Creating PayPal subscription:', input);
    
    try {
      const db = getPool();
      
      const planResult = await db.query(
        'SELECT * FROM subscription_plans WHERE id = $1',
        [input.planId]
      );

      if (planResult.rows.length === 0) {
        throw new Error('Plan not found');
      }

      const plan = planResult.rows[0];

      if (plan.id === 'gratuit' || plan.id === 'entreprise') {
        throw new Error('Ce plan ne nécessite pas de paiement PayPal');
      }

      const { id, approvalUrl } = await createSubscription(
        input.planId,
        input.userId,
        input.returnUrl,
        input.cancelUrl
      );

      await db.query(
        `INSERT INTO user_subscriptions (user_id, plan_id, paypal_subscription_id, status, payment_method)
         VALUES ($1, $2, $3, 'pending', 'paypal')
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           plan_id = EXCLUDED.plan_id,
           paypal_subscription_id = EXCLUDED.paypal_subscription_id,
           status = 'pending',
           payment_method = 'paypal',
           updated_at = NOW()`,
        [input.userId, input.planId, id]
      );

      console.log('[tRPC] PayPal subscription created successfully:', id);
      
      return {
        success: true,
        subscriptionId: id,
        approvalUrl,
      };
    } catch (error: any) {
      console.error('[tRPC] Error creating PayPal subscription:', error);
      throw new Error(error.message || 'Failed to create PayPal subscription');
    }
  });
