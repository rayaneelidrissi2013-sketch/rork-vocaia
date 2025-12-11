import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';

export const sendVerificationCodeProcedure = publicProcedure
  .input(z.object({
    phoneNumber: z.string(),
    countryCode: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[SMS Verification] Sending code to:', input.countryCode + input.phoneNumber);
    
    const code = '1234';
    
    console.log('[SMS Verification] Demo code:', code);
    console.log('[SMS Verification] NOTE: This is a demo implementation using code 1234. In production, integrate with SMS provider like Twilio.');
    
    return { 
      success: true, 
      message: 'Code de vérification envoyé (utilisez 1234 pour le test)',
      mockCode: code
    };
  });
