import { publicProcedure } from '@/backend/trpc/create-context';
import { Pool } from 'pg';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';

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

export const getPricingPlansProcedure = publicProcedure.query(async () => {
  try {
    console.log('[tRPC] Getting pricing plans from database');
    
    const db = getPool();
    const result = await db.query(
      `SELECT 
        id,
        name,
        minutes_included,
        price,
        features,
        is_recommended,
        overage_policy,
        overage_rate,
        created_at,
        updated_at
      FROM subscription_plans
      ORDER BY price ASC`
    );

    console.log(`[tRPC] Found ${result.rows.length} pricing plans`);
    
    return {
      success: true,
      plans: result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        minutesIncluded: row.minutes_included,
        price: parseFloat(row.price),
        features: row.features || [],
        isRecommended: row.is_recommended,
        overagePolicy: row.overage_policy,
        overageRate: parseFloat(row.overage_rate || '0'),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    };
  } catch (error: any) {
    console.error('[tRPC] Error getting pricing plans:', error);
    
    if (error.message === 'DATABASE_URL_NOT_CONFIGURED') {
      console.log('[tRPC] DATABASE_URL not configured, returning constant plans');
      return {
        success: true,
        plans: SUBSCRIPTION_PLANS.map((plan) => ({
          id: plan.id,
          name: plan.name,
          minutesIncluded: plan.minutesIncluded,
          price: plan.price,
          features: plan.features,
          isRecommended: plan.isRecommended || false,
          overagePolicy: plan.overagePolicy,
          overageRate: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      };
    }
    
    console.error('[tRPC] Unexpected error, returning constant plans');
    return {
      success: true,
      plans: SUBSCRIPTION_PLANS.map((plan) => ({
        id: plan.id,
        name: plan.name,
        minutesIncluded: plan.minutesIncluded,
        price: plan.price,
        features: plan.features,
        isRecommended: plan.isRecommended || false,
        overagePolicy: plan.overagePolicy,
        overageRate: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };
  }
});
