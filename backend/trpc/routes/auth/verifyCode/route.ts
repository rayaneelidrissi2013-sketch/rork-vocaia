import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { getPool } from '@/backend/utils/database';

export const verifyCodeProcedure = publicProcedure
  .input(z.object({
    phoneNumber: z.string(),
    code: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[SMS Verification] Verifying SMS code for phone number:', input.phoneNumber);
    console.log('[SMS Verification] Code received:', input.code);
    
    try {
      const pool = getPool();
      
      const result = await pool.query(
        `SELECT id, code, expires_at, verified 
         FROM sms_verifications 
         WHERE phone_number = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [input.phoneNumber]
      );
      
      if (result.rows.length === 0) {
        console.log('[SMS Verification] ❌ No verification found for:', input.phoneNumber);
        throw new Error('Aucune vérification trouvée pour ce numéro. Veuillez demander un nouveau code.');
      }
      
      const verification = result.rows[0];
      const now = new Date();
      
      if (new Date(verification.expires_at) < now) {
        console.log('[SMS Verification] ❌ Code expired for:', input.phoneNumber);
        throw new Error('Le code a expiré. Veuillez demander un nouveau code.');
      }
      
      if (verification.verified) {
        console.log('[SMS Verification] ❌ Code already used for:', input.phoneNumber);
        throw new Error('Ce code a déjà été utilisé.');
      }
      
      if (verification.code !== input.code) {
        console.log('[SMS Verification] ❌ Invalid code provided for:', input.phoneNumber);
        throw new Error('Code incorrect.');
      }
      
      await pool.query(
        'UPDATE sms_verifications SET verified = true WHERE id = $1',
        [verification.id]
      );
      
      console.log('[SMS Verification] ✅ Phone number verified successfully:', input.phoneNumber);
      
      return { 
        verified: true, 
        message: 'Numéro de téléphone vérifié avec succès'
      };
    } catch (error: any) {
      console.error('[SMS Verification] Error:', error);
      return {
        verified: false,
        message: error.message || 'Erreur lors de la vérification du code'
      };
    }
  });
