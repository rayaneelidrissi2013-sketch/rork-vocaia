import { publicProcedure } from '../../../create-context.js';
import { z } from 'zod';
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

function extractCountryCodeFromPhone(phoneNumber: string): string {
  const phoneClean = phoneNumber.replace(/[^\d+]/g, '');
  
  if (phoneClean.startsWith('+33')) return '+33';
  if (phoneClean.startsWith('+1')) return '+1';
  if (phoneClean.startsWith('+212')) return '+212';
  if (phoneClean.startsWith('+32')) return '+32';
  if (phoneClean.startsWith('+41')) return '+41';
  if (phoneClean.startsWith('+44')) return '+44';
  
  return '+33';
}

export const assignVirtualNumberProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    countryCode: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[AssignVirtualNumber] Assigning virtual number for user:', input.userId);
    console.log('[AssignVirtualNumber] Country code:', input.countryCode);
    
    try {
      const db = getPool();
      
      const virtualNumberQuery = `
        SELECT id, phone_number, country_code 
        FROM virtual_numbers 
        WHERE country_code = $1 
        AND (assigned_user_id IS NULL OR assigned_user_id = '')
        LIMIT 1
      `;
      
      const virtualNumberResult = await db.query(virtualNumberQuery, [input.countryCode]);
      
      if (virtualNumberResult.rows.length === 0) {
        console.warn('[AssignVirtualNumber] No available virtual number for country:', input.countryCode);
        throw new Error(`Aucun numéro virtuel disponible pour le pays ${input.countryCode}`);
      }
      
      const virtualNumber = virtualNumberResult.rows[0];
      console.log('[AssignVirtualNumber] Found available virtual number:', virtualNumber.phone_number);
      
      await db.query(
        `UPDATE virtual_numbers SET assigned_user_id = $1 WHERE id = $2`,
        [input.userId, virtualNumber.id]
      );
      
      await db.query(
        `UPDATE users SET vapi_phone_number = $1 WHERE id = $2`,
        [virtualNumber.phone_number, input.userId]
      );
      
      console.log('[AssignVirtualNumber] Successfully assigned virtual number to user');
      
      return {
        success: true,
        virtualNumber: virtualNumber.phone_number,
        message: 'Numéro virtuel attribué avec succès',
      };
    } catch (error) {
      console.error('[AssignVirtualNumber] Error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Impossible d\'attribuer un numéro virtuel'
      );
    }
  });

export { extractCountryCodeFromPhone };
