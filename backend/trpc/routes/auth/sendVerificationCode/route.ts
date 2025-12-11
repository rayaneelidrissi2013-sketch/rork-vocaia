import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { db } from '@/backend/utils/database';

export const sendVerificationCodeProcedure = publicProcedure
  .input(z.object({
    phoneNumber: z.string(),
    countryCode: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[SMS Verification] Sending code to phone number:', input.phoneNumber);
    console.log('[SMS Verification] Country code:', input.countryCode);
    
    try {
      const existingUser = await db.users.findByPhoneNumber(input.phoneNumber);
      if (existingUser) {
        console.log('[SMS Verification] User already exists with phone number:', input.phoneNumber);
        throw new Error('Un utilisateur avec ce numéro de téléphone existe déjà');
      }
      
      const code = '1234';
      
      console.log('[SMS Verification] Demo code:', code);
      console.log('[SMS Verification] NOTE: This is a demo implementation using code 1234.');
      console.log('[SMS Verification] TODO: In production, integrate with SMS provider like Twilio to send:', code, 'to', input.phoneNumber);
      
      return { 
        success: true, 
        message: 'Code de vérification envoyé par SMS (utilisez 1234 pour le test)',
        mockCode: code
      };
    } catch (error: any) {
      console.error('[SMS Verification] Error:', error);
      throw new Error(error.message || 'Erreur lors de l\'envoi du code SMS');
    }
  });
