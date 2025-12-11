import { publicProcedure } from '@/backend/trpc/create-context';
import { getPool } from '@/backend/utils/database';
import * as fs from 'fs';
import * as path from 'path';

export const runMigrationProcedure = publicProcedure
  .mutation(async () => {
    console.log('[MIGRATION] Starting database migration...');
    
    try {
      const pool = getPool();
      
      console.log('[MIGRATION] Reading schema file...');
      const schemaPath = path.join(process.cwd(), 'backend', 'database', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      console.log('[MIGRATION] Schema loaded:', schema.length, 'characters');
      
      console.log('[MIGRATION] Executing migration...');
      await pool.query(schema);
      console.log('[MIGRATION] Migration executed successfully');
      
      console.log('[MIGRATION] Verifying tables...');
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      const tables = tablesResult.rows.map((row: any) => row.table_name);
      console.log('[MIGRATION] Tables created:', tables);
      
      console.log('[MIGRATION] Verifying data...');
      const plansResult = await pool.query('SELECT COUNT(*) as count FROM subscription_plans');
      const settingsResult = await pool.query('SELECT COUNT(*) as count FROM global_settings');
      const usersResult = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = \'admin\'');
      
      const verification = {
        subscriptionPlans: parseInt(plansResult.rows[0].count, 10),
        globalSettings: parseInt(settingsResult.rows[0].count, 10),
        adminUsers: parseInt(usersResult.rows[0].count, 10),
      };
      
      console.log('[MIGRATION] Data verification:', verification);
      console.log('[MIGRATION] ✅ Migration completed successfully!');
      
      return {
        success: true,
        message: 'Migration de la base de données terminée avec succès',
        tables,
        verification,
      };
    } catch (error: any) {
      console.error('[MIGRATION] Error:', error);
      console.error('[MIGRATION] Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack,
      });
      
      return {
        success: false,
        message: `Erreur lors de la migration: ${error.message}`,
        error: {
          code: error.code,
          detail: error.detail,
        },
      };
    }
  });
