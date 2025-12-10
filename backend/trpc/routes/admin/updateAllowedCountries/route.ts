import { publicProcedure } from '../../../create-context.js';
import { z } from 'zod';
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

export const updateAllowedCountriesProcedure = publicProcedure
  .input(z.object({
    allowedCountries: z.array(z.string()),
  }))
  .mutation(async ({ input }) => {
    console.log('[updateAllowedCountries] Updating allowed countries:', input.allowedCountries);
    
    const pool = getPool();
    
    try {
      const allowedCountriesJson = JSON.stringify(input.allowedCountries);
      
      await pool.query(
        `INSERT INTO global_settings (setting_key, setting_value, description)
         VALUES ('allowed_countries', $1, 'Liste des codes pays autorisés pour l''inscription (format JSON array)')
         ON CONFLICT (setting_key) 
         DO UPDATE SET setting_value = $1`,
        [allowedCountriesJson]
      );
      
      console.log('[updateAllowedCountries] Allowed countries updated successfully');
      
      return { 
        success: true, 
        allowedCountries: input.allowedCountries 
      };
    } catch (error) {
      console.error('[updateAllowedCountries] Error:', error);
      throw error;
    } finally {
      await pool.end();
    }
  });
