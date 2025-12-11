import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { db } from '@/backend/utils/database';

export const sendVerificationCodeProcedure = publicProcedure
  .input(z.object({
    phoneNumber: z.string(),
    countryCode: z.string(),
    email: z.string().email(),
  }))
  .mutation(async ({ input }) => {
    console.log('[SMS Verification] Sending code to:', input.phoneNumber);
    console.log('[SMS Verification] Checking if email already exists:', input.email);
    
    try {
      const existingUser = await db.users.findByEmail(input.email);
      if (existingUser) {
        console.log('[SMS Verification] User already exists with email:', input.email);
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      
      const code = '1234';
      
      console.log('[SMS Verification] Demo code:', code);
      console.log('[SMS Verification] NOTE: This is a demo implementation using code 1234. In production, integrate with SMS provider like Twilio.');
      
      return { 
        success: true, 
        message: 'Code de vérification envoyé (utilisez 1234 pour le test)',
        mockCode: code
      };
    } catch (error: any) {
      console.error('[SMS Verification] Error:', error);
      throw new Error(error.message || 'Erreur lors de l\'envoi du code');
    }
  });
