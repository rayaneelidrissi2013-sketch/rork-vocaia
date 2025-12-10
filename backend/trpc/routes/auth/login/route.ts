import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[LOGIN] Attempt for email:', input.email);

    if (input.email === 'demo@vocaia.com' && input.password === 'demo123') {
      return {
        success: true,
        user: {
          id: 'demo-user-id',
          email: 'demo@vocaia.com',
          name: 'Utilisateur Démo',
          phoneNumber: '+33612345678',
          language: 'fr',
          timezone: 'Europe/Paris',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      };
    }

    if (input.email === 'admin@vocaia.com' && input.password === 'admin123') {
      return {
        success: true,
        user: {
          id: 'admin-user-id',
          email: 'admin@vocaia.com',
          name: 'Administrateur',
          phoneNumber: '+33612345678',
          language: 'fr',
          timezone: 'Europe/Paris',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
      };
    }

    throw new Error('Email ou mot de passe incorrect');
  });
