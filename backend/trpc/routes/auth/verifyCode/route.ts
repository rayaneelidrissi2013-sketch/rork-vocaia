import { publicProcedure } from '../../../create-context.js';
import { z } from 'zod';

export const verifyCodeProcedure = publicProcedure
  .input(z.object({
    phoneNumber: z.string(),
    code: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[SMS Verification] Verifying code for:', input.phoneNumber);
    console.log('[SMS Verification] Code received:', input.code);
    
    console.log('[SMS Verification] NOTE: Mock verification - accepting code "123456" for testing');
    
    if (input.code === '123456') {
      return { 
        verified: true, 
        message: 'Numéro vérifié avec succès'
      };
    }
    
    return { 
      verified: false, 
      message: 'Code incorrect. Utilisez 123456 pour le test.'
    };
  });
