import { protectedProcedure } from '@/backend/trpc/create-context';
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

const updateCGUSchema = z.object({
  content: z.string(),
});

export const updateCGUProcedure = protectedProcedure
  .input(updateCGUSchema)
  .mutation(async ({ input }) => {
    console.log('[tRPC updateCGU] Updating CGU');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL_NOT_CONFIGURED');
    }
    
    try {
      const db = getPool();
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS terms_of_service (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await db.query(createTableQuery);
      
      const result = await db.query(
        `INSERT INTO terms_of_service (content) VALUES ($1)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [input.content]
      );
      
      if (result.rows.length === 0) {
        await db.query(
          `UPDATE terms_of_service SET content = $1, updated_at = NOW()`,
          [input.content]
        );
      }
      
      console.log('[tRPC updateCGU] CGU updated successfully');
      return {
        success: true,
        message: 'CGU mis à jour avec succès',
      };
    } catch (error: any) {
      console.error('[tRPC updateCGU] Error updating CGU:', error);
      throw new Error('Failed to update CGU: ' + (error.message || 'Unknown error'));
    }
  });
