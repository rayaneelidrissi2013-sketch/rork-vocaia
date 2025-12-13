import { publicProcedure } from '@/backend/trpc/create-context';
import { Pool } from 'pg';
import { z } from 'zod';

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

export default publicProcedure
  .input(z.object({ 
    currentPlanId: z.string().optional(),
    upgradeOnly: z.boolean().optional() 
  }).optional())
  .query(async ({ input }) => {
    console.log('[tRPC] Getting subscription plans from database');
    
    try {
      const db = getPool();
      const result = await db.query(
        `SELECT 
          id,
          name,
          minutes_included,
          price,
          features,
          is_recommended
        FROM subscription_plans
        ORDER BY 
          CASE 
            WHEN id = 'entreprise' THEN 999999
            ELSE price
          END ASC`
      );

      let plans = result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        minutesIncluded: row.minutes_included,
        price: parseFloat(row.price),
        features: Array.isArray(row.features) ? row.features : [],
        isRecommended: row.is_recommended,
        isEnterprise: row.id === 'entreprise',
      }));

      if (input?.upgradeOnly && input?.currentPlanId) {
        const currentPlan = plans.find(p => p.id === input.currentPlanId);
        if (currentPlan) {
          console.log(`[tRPC] Filtering plans superior to ${input.currentPlanId} (price: ${currentPlan.price})`);
          plans = plans.filter(p => {
            if (p.isEnterprise) return true;
            if (p.id === input.currentPlanId) return false;
            return p.price > currentPlan.price;
          });
        }
      }

      console.log(`[tRPC] Found ${plans.length} subscription plans`);
      
      return {
        plans,
      };
    } catch (error) {
      console.error('[tRPC] Error getting subscription plans:', error);
      throw new Error('Failed to get subscription plans');
    }
  });
