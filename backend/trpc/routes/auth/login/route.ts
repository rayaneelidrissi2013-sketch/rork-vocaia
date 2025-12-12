import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { getPool } from '@/backend/utils/database';
import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[LOGIN] Attempt for email:', input.email);

    try {
      const pool = getPool();
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [input.email]
      );

      if (result.rows.length === 0) {
        console.log('[LOGIN] User not found:', input.email);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Email ou mot de passe incorrect',
        });
      }

      const user = result.rows[0];
      console.log('[LOGIN] User found:', user.id, 'Checking password...');

      let isPasswordValid = false;

      // Vérification spéciale pour l'administrateur
      if (input.email === 'tawfikelidrissi@gmail.com' && input.password === 'admin123') {
        console.log('[LOGIN] Admin login with direct password');
        isPasswordValid = true;
      } else {
        // Vérification normale avec bcrypt
        isPasswordValid = await bcrypt.compare(
          input.password,
          user.password_hash
        );
      }

      if (!isPasswordValid) {
        console.log('[LOGIN] Invalid password for:', input.email);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Email ou mot de passe incorrect',
        });
      }

      console.log('[LOGIN] Login successful for:', input.email);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phoneNumber: user.phone_number,
          language: 'fr',
          timezone: 'Europe/Paris',
          role: user.email === 'tawfikelidrissi@gmail.com' ? 'admin' : 'user',
          createdAt: user.created_at,
        },
      };
    } catch (error) {
      console.error('[LOGIN] Error:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors de la connexion',
      });
    }
  });
