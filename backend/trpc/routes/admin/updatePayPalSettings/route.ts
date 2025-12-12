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

export const updatePayPalSettingsProcedure = publicProcedure
  .input(z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    mode: z.enum(['sandbox', 'live']),
  }))
  .mutation(async ({ input }) => {
    try {
      console.log('[tRPC] Updating PayPal settings');
      
      const db = getPool();
      
      await db.query(
        `INSERT INTO global_settings (setting_key, setting_value, description)
         VALUES 
           ('paypal_client_id', $1, 'Client ID PayPal pour les paiements'),
           ('paypal_client_secret', $2, 'Client Secret PayPal pour les paiements'),
           ('paypal_mode', $3, 'Mode PayPal: sandbox ou live')
         ON CONFLICT (setting_key) 
         DO UPDATE SET 
           setting_value = EXCLUDED.setting_value,
           updated_at = NOW()`,
        [input.clientId, input.clientSecret, input.mode]
      );

      console.log('[tRPC] PayPal settings updated successfully');
      
      return {
        success: true,
        message: 'PayPal settings updated successfully',
      };
    } catch (error: any) {
      console.error('[tRPC] Error updating PayPal settings:', error);
      throw new Error('Failed to update PayPal settings');
    }
  });
