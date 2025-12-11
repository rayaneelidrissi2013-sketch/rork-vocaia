import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';

export const verifyCodeProcedure = publicProcedure
  .input(z.object({
    phoneNumber: z.string(),
    code: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[SMS Verification] Verifying SMS code for phone number:', input.phoneNumber);
    console.log('[SMS Verification] Code received:', input.code);
    
    console.log('[SMS Verification] NOTE: Demo verification - accepting code "1234" for testing');
    console.log('[SMS Verification] TODO: In production, verify the SMS code sent to', input.phoneNumber);
    
    if (input.code === '1234') {
      console.log('[SMS Verification] ✅ Phone number verified successfully:', input.phoneNumber);
      return { 
        verified: true, 
        message: 'Numéro de téléphone vérifié avec succès'
      };
    }
    
    console.log('[SMS Verification] ❌ Invalid code provided for:', input.phoneNumber);
    return { 
      verified: false, 
      message: 'Code SMS incorrect. Utilisez 1234 pour le test.'
    };
  });
