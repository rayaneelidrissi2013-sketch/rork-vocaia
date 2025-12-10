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

const updateUserPasswordSchema = z.object({
  userId: z.string(),
  newPassword: z.string().min(6),
});

export const updateUserPasswordProcedure = publicProcedure
  .input(updateUserPasswordSchema)
  .mutation(async ({ input }) => {
    try {
      console.log('[tRPC updateUserPassword] Updating password for user:', input.userId);

      const query = `
        UPDATE users
        SET password = $1
        WHERE id = $2
        RETURNING id, email
      `;

      const db = getPool();
      const result = await db.query(query, [input.newPassword, input.userId]);

      if (result.rowCount === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      console.log('[tRPC updateUserPassword] Password updated successfully');

      return {
        success: true,
        message: 'Mot de passe modifié avec succès',
      };
    } catch (error) {
      console.error('[tRPC updateUserPassword] Error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Impossible de modifier le mot de passe'
      );
    }
  });
