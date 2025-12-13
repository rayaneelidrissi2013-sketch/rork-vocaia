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

export const updateSMTPSettingsProcedure = publicProcedure
  .input(z.object({
    smtp_host: z.string(),
    smtp_port: z.string(),
    smtp_user: z.string(),
    smtp_password: z.string(),
    smtp_from_email: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[UpdateSMTPSettings] Updating SMTP settings');
    
    try {
      const db = getPool();
      
      for (const [key, value] of Object.entries(input)) {
        await db.query(
          `INSERT INTO global_settings (setting_key, setting_value)
           VALUES ($1, $2)
           ON CONFLICT (setting_key)
           DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()`,
          [key, value]
        );
      }
      
      console.log('[UpdateSMTPSettings] SMTP settings updated successfully');
      
      return {
        success: true,
        message: 'Paramètres SMTP mis à jour avec succès',
      };
    } catch (error: any) {
      console.error('[UpdateSMTPSettings] Error:', error);
      throw new Error(error.message || 'Erreur lors de la mise à jour des paramètres SMTP');
    }
  });
