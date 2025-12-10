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

const deletePricingPlanSchema = z.object({
  id: z.string(),
});

export const deletePricingPlanProcedure = publicProcedure
  .input(deletePricingPlanSchema)
  .mutation(async ({ input }) => {
    try {
      console.log('[tRPC] Deleting pricing plan:', input.id);

      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        console.log('[tRPC] DATABASE_URL not configured, plan deletion is not available in mock mode');
        throw new Error('La suppression de packs n\'est disponible qu\'avec une base de données configurée. Veuillez contacter l\'administrateur.');
      }

      const query = `
        DELETE FROM subscription_plans
        WHERE id = $1
        RETURNING id
      `;

      const db = getPool();
      const result = await db.query(query, [input.id]);

      if (result.rowCount === 0) {
        throw new Error('Plan tarifaire non trouvé');
      }

      console.log('[tRPC] Pricing plan deleted successfully');

      return {
        success: true,
        message: 'Pack supprimé avec succès',
      };
    } catch (error) {
      console.error('[tRPC] Error deleting pricing plan:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Échec de la suppression du plan tarifaire'
      );
    }
  });
