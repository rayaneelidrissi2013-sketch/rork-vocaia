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

export const getVirtualNumbersProcedure = publicProcedure
  .query(async () => {
    console.log('[GetVirtualNumbers] Fetching all virtual numbers');
    
    try {
      const db = getPool();
      
      const result = await db.query(
        `SELECT id, phone_number, country, country_code, provider, status, assigned_user_id, webhook_url, created_at
         FROM virtual_numbers
         ORDER BY created_at DESC`
      );
      
      console.log(`[GetVirtualNumbers] Found ${result.rows.length} virtual numbers`);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        phoneNumber: row.phone_number,
        country: row.country,
        countryCode: row.country_code,
        provider: row.provider,
        status: row.status,
        assignedUserId: row.assigned_user_id,
        webhookUrl: row.webhook_url,
        createdAt: row.created_at,
      }));
    } catch (error: any) {
      console.error('[GetVirtualNumbers] Error:', error);
      throw new Error(error.message || 'Erreur lors de la récupération des numéros virtuels');
    }
  });
