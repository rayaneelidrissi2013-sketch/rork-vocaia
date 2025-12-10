import { publicProcedure } from '@/backend/trpc/create-context';
import { Pool } from 'pg';

const getPool = (): Pool => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not configured');
  }

  return new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
};

export const getAllowedCountriesProcedure = publicProcedure
  .query(async () => {
    console.log('[getAllowedCountries] Fetching allowed countries configuration');
    
    const pool = getPool();
    
    try {
      const result = await pool.query(
        `SELECT setting_value FROM global_settings WHERE setting_key = 'allowed_countries' LIMIT 1`
      );
      
      if (result.rows.length === 0) {
        console.log('[getAllowedCountries] No configuration found, returning default ["+1"]');
        return { allowedCountries: ['+1'] };
      }
      
      const allowedCountries = JSON.parse(result.rows[0].setting_value);
      console.log('[getAllowedCountries] Allowed countries:', allowedCountries);
      
      return { allowedCountries };
    } catch (error) {
      console.error('[getAllowedCountries] Error:', error);
      throw error;
    } finally {
      await pool.end();
    }
  });
