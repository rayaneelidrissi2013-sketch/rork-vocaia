import { publicProcedure } from '@/backend/trpc/create-context';
import { Pool } from 'pg';

let pool: Pool | null = null;

const getPool = (): Pool => {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.warn('[getAllUsers] DATABASE_URL non définie');
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

export const getAllUsersProcedure = publicProcedure
  .query(async () => {
    console.log('[tRPC getAllUsers] Starting query');
    
    try {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        console.error('[tRPC getAllUsers] DATABASE_URL not configured');
        throw new Error('DATABASE_URL_NOT_CONFIGURED');
      }
      
      const db = getPool();
      console.log('[tRPC getAllUsers] Executing database query');
      
      const result = await db.query(
        `SELECT 
          id, email, name, phone_number, language, timezone, role,
          vapi_agent_id, vapi_phone_number,
          user_personal_phone, is_agent_active,
          custom_prompt_template, profession,
          plan_id, minutes_included,
          minutes_remaining, minutes_consumed,
          date_renouvellement,
          registration_date, created_at,
          country_code
        FROM users 
        WHERE role = 'user'
        ORDER BY created_at DESC`
      );
      
      console.log(`[tRPC getAllUsers] Successfully found ${result.rows.length} users`);
      
      const users = result.rows.map((row: any) => ({
        id: String(row.id),
        email: String(row.email),
        name: String(row.name),
        phoneNumber: String(row.phone_number),
        language: String(row.language || 'fr'),
        timezone: String(row.timezone || 'Europe/Paris'),
        role: String(row.role),
        vapiAgentId: row.vapi_agent_id ? String(row.vapi_agent_id) : '',
        vapiPhoneNumber: row.vapi_phone_number ? String(row.vapi_phone_number) : '',
        userPersonalPhone: row.user_personal_phone ? String(row.user_personal_phone) : '',
        isAgentActive: Boolean(row.is_agent_active),
        customPromptTemplate: row.custom_prompt_template ? String(row.custom_prompt_template) : '',
        profession: row.profession ? String(row.profession) : '',
        planId: String(row.plan_id || 'gratuit'),
        minutesIncluded: Number(row.minutes_included || 0),
        minutesRemaining: Number(row.minutes_remaining || 0),
        minutesConsumed: Number(row.minutes_consumed || 0),
        dateRenouvellement: row.date_renouvellement ? new Date(row.date_renouvellement).toISOString() : new Date().toISOString(),
        registrationDate: row.registration_date ? new Date(row.registration_date).toISOString() : new Date().toISOString(),
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        countryCode: row.country_code ? String(row.country_code) : '',
      }));
      
      return users;
    } catch (error: any) {
      console.error('[tRPC getAllUsers] Error caught:', error);
      console.error('[tRPC getAllUsers] Database error:', error.message);
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }
  });
