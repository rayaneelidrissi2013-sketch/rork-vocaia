import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
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

export const forgotPasswordProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
  }))
  .mutation(async ({ input }) => {
    console.log('[tRPC] Forgot password request for:', input.email);

    try {
      const db = getPool();
      
      const result = await db.query(
        'SELECT id, email, name FROM users WHERE email = $1',
        [input.email]
      );

      if (result.rows.length === 0) {
        console.log('[tRPC] User not found, but returning success for security');
        return {
          success: true,
          message: 'If an account exists, a password reset email will be sent.',
        };
      }

      const user = result.rows[0];
      
      console.log('[tRPC] Password reset requested for user:', user.email);
      console.log('[tRPC] NOTE: Email sending not implemented yet. In production, send email here.');
      console.log('[tRPC] User would receive email at:', user.email);

      return {
        success: true,
        message: 'If an account exists, a password reset email will be sent.',
      };
    } catch (error: any) {
      console.error('[tRPC] Forgot password error:', error);
      throw new Error('Une erreur est survenue. Veuillez réessayer.');
    }
  });
