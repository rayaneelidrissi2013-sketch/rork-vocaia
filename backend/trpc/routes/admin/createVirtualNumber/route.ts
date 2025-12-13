import { publicProcedure } from '@/backend/trpc/create-context';
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

export const createVirtualNumberProcedure = publicProcedure
  .input(z.object({
    phoneNumber: z.string(),
    country: z.string(),
    countryCode: z.string(),
    provider: z.string(),
    webhookUrl: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[CreateVirtualNumber] Creating virtual number:', input.phoneNumber);
    
    try {
      const db = getPool();
      
      const result = await db.query(
        `INSERT INTO virtual_numbers (phone_number, country, country_code, provider, status, webhook_url)
         VALUES ($1, $2, $3, $4, 'active', $5)
         RETURNING id, phone_number, country, country_code, provider, status, assigned_user_id, webhook_url, created_at`,
        [input.phoneNumber, input.country, input.countryCode, input.provider, input.webhookUrl || '']
      );
      
      console.log('[CreateVirtualNumber] Virtual number created successfully:', result.rows[0].id);
      
      return {
        success: true,
        virtualNumber: result.rows[0],
      };
    } catch (error: any) {
      console.error('[CreateVirtualNumber] Error:', error);
      
      if (error.code === '23505') {
        throw new Error('Ce numéro existe déjà');
      }
      
      throw new Error(error.message || 'Erreur lors de la création du numéro virtuel');
    }
  });
