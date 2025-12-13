import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
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

export const deleteVirtualNumberProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[DeleteVirtualNumber] Deleting virtual number:', input.id);
    
    try {
      const db = getPool();
      
      await db.query(
        'DELETE FROM virtual_numbers WHERE id = $1',
        [input.id]
      );
      
      console.log('[DeleteVirtualNumber] Virtual number deleted successfully');
      
      return {
        success: true,
      };
    } catch (error: any) {
      console.error('[DeleteVirtualNumber] Error:', error);
      throw new Error(error.message || 'Erreur lors de la suppression du numéro virtuel');
    }
  });
