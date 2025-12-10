import { publicProcedure } from '../../../create-context.js';
import { Pool } from 'pg';
import { z } from 'zod';
import { extractCountryCodeFromPhone } from '../../user/assignVirtualNumber/route.js';

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

const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: z.string(),
  profession: z.string().optional(),
  planId: z.string(),
  language: z.string().default('fr'),
  countryCode: z.string().default('FR'),
});

export const createUserProcedure = publicProcedure
  .input(createUserSchema)
  .mutation(async ({ input }) => {
    try {
      console.log('[tRPC createUser] Creating new user:', input.email);

      const db = getPool();
      
      const checkQuery = `SELECT id FROM users WHERE email = $1`;
      const checkResult = await db.query(checkQuery, [input.email]);
      
      if (checkResult.rows.length > 0) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      const insertQuery = `
        INSERT INTO users (
          name, email, password, phone_number, profession, 
          plan_id, language, country_code, 
          minutes_included, minutes_remaining, minutes_consumed,
          is_agent_active, role, timezone,
          registration_date, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING id, name, email, phone_number, profession, 
                  plan_id, language, country_code, 
                  minutes_included, minutes_remaining, created_at
      `;

      const minutesMap: Record<string, number> = {
        'free': 1,
        'essentiel': 15,
        'pro': 100,
        'expert': 300,
      };

      const minutesIncluded = minutesMap[input.planId] || 0;

      const result = await db.query(insertQuery, [
        input.name,
        input.email,
        input.password,
        input.phoneNumber,
        input.profession || '',
        input.planId,
        input.language,
        input.countryCode,
        minutesIncluded,
        minutesIncluded,
        0,
        false,
        'user',
        'Europe/Paris',
      ]);

      const user = result.rows[0];
      console.log('[tRPC createUser] User created successfully:', user.id);

      const countryCodeFromPhone = extractCountryCodeFromPhone(input.phoneNumber);
      console.log('[tRPC createUser] Detected country code from phone:', countryCodeFromPhone);
      
      try {
        const virtualNumberQuery = `
          SELECT id, phone_number, country_code 
          FROM virtual_numbers 
          WHERE country_code = $1 
          AND (assigned_user_id IS NULL OR assigned_user_id = '')
          LIMIT 1
        `;
        
        const virtualNumberResult = await db.query(virtualNumberQuery, [countryCodeFromPhone]);
        
        if (virtualNumberResult.rows.length > 0) {
          const virtualNumber = virtualNumberResult.rows[0];
          console.log('[tRPC createUser] Assigning virtual number:', virtualNumber.phone_number);
          
          await db.query(
            `UPDATE virtual_numbers SET assigned_user_id = $1 WHERE id = $2`,
            [user.id, virtualNumber.id]
          );
          
          await db.query(
            `UPDATE users SET vapi_phone_number = $1 WHERE id = $2`,
            [virtualNumber.phone_number, user.id]
          );
          
          console.log('[tRPC createUser] Virtual number assigned successfully');
        } else {
          console.warn('[tRPC createUser] No available virtual number for country:', countryCodeFromPhone);
        }
      } catch (assignError) {
        console.error('[tRPC createUser] Error assigning virtual number:', assignError);
      }

      return {
        success: true,
        user: JSON.parse(JSON.stringify({
          id: String(user.id),
          name: String(user.name),
          email: String(user.email),
          phoneNumber: String(user.phone_number),
          profession: String(user.profession),
          planId: String(user.plan_id),
          language: String(user.language),
          countryCode: String(user.country_code),
          minutesIncluded: Number(user.minutes_included),
          minutesRemaining: Number(user.minutes_remaining),
          createdAt: new Date(user.created_at).toISOString(),
        })),
      };
    } catch (error) {
      console.error('[tRPC createUser] Error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Impossible de créer l\'utilisateur'
      );
    }
  });
