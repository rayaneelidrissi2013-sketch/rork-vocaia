import { publicProcedure } from '@/backend/trpc/create-context';
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

export const getPayPalSettingsProcedure = publicProcedure.query(async () => {
  try {
    console.log('[tRPC] Getting PayPal settings from database');
    
    const db = getPool();
    const result = await db.query(
      `SELECT setting_key, setting_value 
       FROM global_settings 
       WHERE setting_key IN ('paypal_client_id', 'paypal_client_secret', 'paypal_mode')`
    );

    const settings: Record<string, string> = {};
    result.rows.forEach((row: any) => {
      settings[row.setting_key] = row.setting_value;
    });

    console.log('[tRPC] PayPal settings retrieved successfully');
    
    return {
      success: true,
      clientId: settings.paypal_client_id || '',
      clientSecret: settings.paypal_client_secret || '',
      mode: settings.paypal_mode || 'sandbox',
    };
  } catch (error: any) {
    console.error('[tRPC] Error getting PayPal settings:', error);
    throw new Error('Failed to get PayPal settings');
  }
});
