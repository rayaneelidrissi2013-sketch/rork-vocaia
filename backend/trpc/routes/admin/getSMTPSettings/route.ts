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

export const getSMTPSettingsProcedure = publicProcedure
  .query(async () => {
    console.log('[GetSMTPSettings] Fetching SMTP settings');
    
    try {
      const db = getPool();
      
      const result = await db.query(
        `SELECT setting_key, setting_value
         FROM global_settings
         WHERE setting_key IN ('smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from_email')`
      );
      
      const settings: Record<string, string> = {
        smtp_host: '',
        smtp_port: '587',
        smtp_user: '',
        smtp_password: '',
        smtp_from_email: '',
      };
      
      result.rows.forEach((row: any) => {
        settings[row.setting_key] = row.setting_value;
      });
      
      console.log('[GetSMTPSettings] SMTP settings fetched successfully');
      
      return settings;
    } catch (error: any) {
      console.error('[GetSMTPSettings] Error:', error);
      return {
        smtp_host: '',
        smtp_port: '587',
        smtp_user: '',
        smtp_password: '',
        smtp_from_email: '',
      };
    }
  });
