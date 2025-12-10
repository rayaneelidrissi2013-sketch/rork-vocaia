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

const updatePricingPlanSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  minutesIncluded: z.number().optional(),
  price: z.number().optional(),
  features: z.array(z.string()).optional(),
  isRecommended: z.boolean().optional(),
});

export const updatePricingPlanProcedure = publicProcedure
  .input(updatePricingPlanSchema)
  .mutation(async ({ input }) => {
    try {
      console.log('[tRPC] Updating pricing plan:', input.id);

      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        console.log('[tRPC] DATABASE_URL not configured, pricing updates are not available in mock mode');
        throw new Error('La modification des prix n\'est disponible qu\'avec une base de données configurée. Veuillez contacter l\'administrateur.');
      }

      const updates: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (input.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(input.name);
      }

      if (input.minutesIncluded !== undefined) {
        updates.push(`minutes_included = $${paramIndex++}`);
        values.push(input.minutesIncluded);
      }

      if (input.price !== undefined) {
        updates.push(`price = $${paramIndex++}`);
        values.push(input.price);
      }

      if (input.features !== undefined) {
        updates.push(`features = $${paramIndex++}`);
        values.push(JSON.stringify(input.features));
      }

      if (input.isRecommended !== undefined) {
        updates.push(`is_recommended = $${paramIndex++}`);
        values.push(input.isRecommended);
      }

      if (updates.length === 0) {
        throw new Error('Aucun champ à modifier');
      }

      values.push(input.id);

      const query = `
        UPDATE subscription_plans
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const db = getPool();
      const result = await db.query(query, values);

      if (result.rowCount === 0) {
        throw new Error('Plan tarifaire non trouvé');
      }

      console.log('[tRPC] Pricing plan updated successfully');

      const row = result.rows[0];
      return {
        success: true,
        plan: {
          id: String(row.id),
          name: String(row.name),
          minutesIncluded: Number(row.minutes_included),
          price: Number(row.price),
          features: Array.isArray(row.features) ? row.features : (typeof row.features === 'string' ? JSON.parse(row.features) : []),
          isRecommended: Boolean(row.is_recommended),
        },
      };
    } catch (error) {
      console.error('[tRPC] Error updating pricing plan:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Échec de la mise à jour du plan tarifaire'
      );
    }
  });
