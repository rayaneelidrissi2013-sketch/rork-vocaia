import { publicProcedure } from '../../../create-context.js';
import { z } from 'zod';

export const sendVerificationCodeProcedure = publicProcedure
  .input(z.object({
    phoneNumber: z.string(),
    countryCode: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[SMS Verification] Sending code to:', input.countryCode + input.phoneNumber);
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('[SMS Verification] Generated code:', code);
    console.log('[SMS Verification] NOTE: This is a mock implementation. In production, integrate with Vapi.ai API');
    
    return { 
      success: true, 
      message: 'Code de vérification envoyé',
      mockCode: code
    };
  });
