import { publicProcedure } from '../../../create-context.js';
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

export default publicProcedure
  .query(async () => {
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
        ORDER BY price ASC`
      );

      const plans = result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        minutesIncluded: row.minutes_included,
        price: parseFloat(row.price),
        features: Array.isArray(row.features) ? row.features : [],
        isRecommended: row.is_recommended,
        isEnterprise: row.id === 'entreprise',
      }));

      console.log(`[tRPC] Found ${plans.length} subscription plans`);
      
      return {
        plans,
      };
    } catch (error) {
      console.error('[tRPC] Error getting subscription plans:', error);
      throw new Error('Failed to get subscription plans');
    }
  });
