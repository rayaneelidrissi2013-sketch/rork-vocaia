import { publicProcedure } from '../../../create-context.js';
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

const createPricingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  minutesIncluded: z.number(),
  price: z.number(),
  features: z.array(z.string()),
  isRecommended: z.boolean().optional(),
});

export const createPricingPlanProcedure = publicProcedure
  .input(createPricingPlanSchema)
  .mutation(async ({ input }) => {
    try {
      console.log('[tRPC] Creating pricing plan:', input);

      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        console.log('[tRPC] DATABASE_URL not configured, plan creation is not available in mock mode');
        throw new Error('La création de packs n\'est disponible qu\'avec une base de données configurée. Veuillez contacter l\'administrateur.');
      }

      const query = `
        INSERT INTO subscription_plans (id, name, minutes_included, price, features, is_recommended, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;

      const db = getPool();
      const result = await db.query(query, [
        input.id,
        input.name,
        input.minutesIncluded,
        input.price,
        JSON.stringify(input.features),
        input.isRecommended || false,
      ]);

      console.log('[tRPC] Pricing plan created successfully');

      const row = result.rows[0];
      
      const serializedPlan = {
        id: String(row.id),
        name: String(row.name),
        minutesIncluded: Number(row.minutes_included),
        price: Number(row.price),
        features: Array.isArray(row.features) ? row.features : (typeof row.features === 'string' ? JSON.parse(row.features) : []),
        isRecommended: Boolean(row.is_recommended),
      };
      
      return JSON.parse(JSON.stringify({
        success: true,
        plan: serializedPlan,
      }));
    } catch (error) {
      console.error('[tRPC] Error creating pricing plan:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Échec de la création du plan tarifaire'
      );
    }
  });
