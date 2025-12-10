import { Pool } from 'pg';
import type { DBUser, DBCall, DashboardStats, UserDetails, PaymentRecord } from '../types/index.js';

let pool: Pool | null = null;

const getPool = (): Pool => {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.warn('[DB] DATABASE_URL non définie - base de données désactivée');
      throw new Error('DATABASE_URL_NOT_CONFIGURED');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err: Error) => {
      console.error('[DB] Erreur inattendue du pool PostgreSQL:', err);
    });

    console.log('[DB] Pool PostgreSQL initialisé');
  }

  return pool;
};

export const db = {
  users: {
    findByEmail: async (email: string): Promise<DBUser | null> => {
      console.log('[DB] Finding user by email:', email);
      const pool = getPool();
      
      try {
        const result = await pool.query(
          `SELECT 
            id, email, name, phone_number as "phoneNumber", language, timezone, role,
            vapi_agent_id as "vapiAgentId", vapi_phone_number as "vapiPhoneNumber",
            user_personal_phone as "userPersonalPhone", is_agent_active as "isAgentActive",
            custom_prompt_template as "customPromptTemplate", profession,
            plan_id as "planId", minutes_included as "minutesIncluded",
            minutes_remaining as "minutesRemaining", minutes_consumed as "minutesConsumed",
            date_renouvellement as "dateRenouvellement",
            registration_date as "registrationDate", created_at as "createdAt"
          FROM users WHERE email = $1`,
          [email]
        );
        
        return result.rows[0] || null;
      } catch (error) {
        console.error('[DB] Error finding user by email:', error);
        throw error;
      }
    },
    
    findById: async (id: string): Promise<DBUser | null> => {
      console.log('[DB] Finding user by id:', id);
      const pool = getPool();
      
      try {
        const result = await pool.query(
          `SELECT 
            id, email, name, phone_number as "phoneNumber", language, timezone, role,
            vapi_agent_id as "vapiAgentId", vapi_phone_number as "vapiPhoneNumber",
            user_personal_phone as "userPersonalPhone", is_agent_active as "isAgentActive",
            custom_prompt_template as "customPromptTemplate", profession,
            plan_id as "planId", minutes_included as "minutesIncluded",
            minutes_remaining as "minutesRemaining", minutes_consumed as "minutesConsumed",
            date_renouvellement as "dateRenouvellement",
            registration_date as "registrationDate", created_at as "createdAt"
          FROM users WHERE id = $1`,
          [id]
        );
        
        return result.rows[0] || null;
      } catch (error) {
        console.error('[DB] Error finding user by id:', error);
        throw error;
      }
    },
    
    findByVapiPhoneNumber: async (phoneNumber: string): Promise<DBUser | null> => {
      console.log('[DB] Finding user by Vapi phone number:', phoneNumber);
      const pool = getPool();
      
      try {
        const result = await pool.query(
          `SELECT 
            id, email, name, phone_number as "phoneNumber", language, timezone, role,
            vapi_agent_id as "vapiAgentId", vapi_phone_number as "vapiPhoneNumber",
            user_personal_phone as "userPersonalPhone", is_agent_active as "isAgentActive",
            custom_prompt_template as "customPromptTemplate", profession,
            plan_id as "planId", minutes_included as "minutesIncluded",
            minutes_remaining as "minutesRemaining", minutes_consumed as "minutesConsumed",
            date_renouvellement as "dateRenouvellement",
            registration_date as "registrationDate", created_at as "createdAt"
          FROM users WHERE vapi_phone_number = $1`,
          [phoneNumber]
        );
        
        return result.rows[0] || null;
      } catch (error) {
        console.error('[DB] Error finding user by Vapi phone number:', error);
        throw error;
      }
    },
    
    create: async (user: Omit<DBUser, 'id'>): Promise<DBUser> => {
      console.log('[DB] Creating user:', user.email);
      const pool = getPool();
      
      try {
        const result = await pool.query(
          `INSERT INTO users (
            email, name, phone_number, language, timezone, role,
            vapi_agent_id, vapi_phone_number, user_personal_phone, is_agent_active,
            custom_prompt_template, profession, plan_id, minutes_included,
            minutes_remaining, minutes_consumed, date_renouvellement
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          RETURNING 
            id, email, name, phone_number as "phoneNumber", language, timezone, role,
            vapi_agent_id as "vapiAgentId", vapi_phone_number as "vapiPhoneNumber",
            user_personal_phone as "userPersonalPhone", is_agent_active as "isAgentActive",
            custom_prompt_template as "customPromptTemplate", profession,
            plan_id as "planId", minutes_included as "minutesIncluded",
            minutes_remaining as "minutesRemaining", minutes_consumed as "minutesConsumed",
            date_renouvellement as "dateRenouvellement",
            registration_date as "registrationDate", created_at as "createdAt"`,
          [
            user.email, user.name, user.phoneNumber, user.language || 'fr',
            user.timezone || 'Europe/Paris', user.role || 'user',
            user.vapiAgentId, user.vapiPhoneNumber, user.userPersonalPhone,
            user.isAgentActive || false, user.customPromptTemplate, user.profession,
            user.planId, user.minutesIncluded || 0, user.minutesRemaining || 0,
            user.minutesConsumed || 0, user.dateRenouvellement
          ]
        );
        
        return result.rows[0];
      } catch (error) {
        console.error('[DB] Error creating user:', error);
        throw error;
      }
    },
    
    update: async (id: string, updates: Partial<DBUser>): Promise<DBUser> => {
      console.log('[DB] Updating user:', id, updates);
      const pool = getPool();
      
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const fieldMap: Record<string, string> = {
        email: 'email',
        name: 'name',
        phoneNumber: 'phone_number',
        language: 'language',
        timezone: 'timezone',
        role: 'role',
        vapiAgentId: 'vapi_agent_id',
        vapiPhoneNumber: 'vapi_phone_number',
        userPersonalPhone: 'user_personal_phone',
        isAgentActive: 'is_agent_active',
        customPromptTemplate: 'custom_prompt_template',
        profession: 'profession',
        planId: 'plan_id',
        minutesIncluded: 'minutes_included',
        minutesRemaining: 'minutes_remaining',
        minutesConsumed: 'minutes_consumed',
        dateRenouvellement: 'date_renouvellement',
      };

      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'createdAt' && fieldMap[key]) {
          fields.push(`${fieldMap[key]} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (fields.length === 0) {
        return await db.users.findById(id) as DBUser;
      }

      values.push(id);

      try {
        const result = await pool.query(
          `UPDATE users SET ${fields.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING 
            id, email, name, phone_number as "phoneNumber", language, timezone, role,
            vapi_agent_id as "vapiAgentId", vapi_phone_number as "vapiPhoneNumber",
            user_personal_phone as "userPersonalPhone", is_agent_active as "isAgentActive",
            custom_prompt_template as "customPromptTemplate", profession,
            plan_id as "planId", minutes_included as "minutesIncluded",
            minutes_remaining as "minutesRemaining", minutes_consumed as "minutesConsumed",
            date_renouvellement as "dateRenouvellement",
            registration_date as "registrationDate", created_at as "createdAt"`,
          values
        );

        if (result.rows.length === 0) {
          throw new Error('User not found');
        }

        return result.rows[0];
      } catch (error) {
        console.error('[DB] Error updating user:', error);
        throw error;
      }
    },
    
    getAll: async (): Promise<DBUser[]> => {
      console.log('[DB] Getting all users');
      const pool = getPool();
      
      try {
        const result = await pool.query(
          `SELECT 
            id, email, name, phone_number as "phoneNumber", language, timezone, role,
            vapi_agent_id as "vapiAgentId", vapi_phone_number as "vapiPhoneNumber",
            user_personal_phone as "userPersonalPhone", is_agent_active as "isAgentActive",
            custom_prompt_template as "customPromptTemplate", profession,
            plan_id as "planId", minutes_included as "minutesIncluded",
            minutes_remaining as "minutesRemaining", minutes_consumed as "minutesConsumed",
            date_renouvellement as "dateRenouvellement",
            registration_date as "registrationDate", created_at as "createdAt"
          FROM users ORDER BY created_at DESC`
        );
        
        return result.rows;
      } catch (error) {
        console.error('[DB] Error getting all users:', error);
        if ((error as any).message === 'DATABASE_URL_NOT_CONFIGURED') {
          return [];
        }
        throw error;
      }
    },
    
    getActiveCount: async (): Promise<number> => {
      console.log('[DB] Getting active users count');
      const pool = getPool();
      
      try {
        const result = await pool.query(
          'SELECT COUNT(*) as count FROM users WHERE is_agent_active = true'
        );
        
        return parseInt(result.rows[0].count, 10);
      } catch (error) {
        console.error('[DB] Error getting active users count:', error);
        throw error;
      }
    },
    
    getInactiveCount: async (): Promise<number> => {
      console.log('[DB] Getting inactive users count');
      const pool = getPool();
      
      try {
        const result = await pool.query(
          'SELECT COUNT(*) as count FROM users WHERE is_agent_active = false'
        );
        
        return parseInt(result.rows[0].count, 10);
      } catch (error) {
        console.error('[DB] Error getting inactive users count:', error);
        throw error;
      }
    },

    getUserDetails: async (userId: string): Promise<UserDetails | null> => {
      console.log('[DB] Getting user details:', userId);
      const pool = getPool();
      
      try {
        const userResult = await pool.query(
          `SELECT 
            id, email, name, phone_number as "phoneNumber", language, timezone, role,
            vapi_agent_id as "vapiAgentId", vapi_phone_number as "vapiPhoneNumber",
            user_personal_phone as "userPersonalPhone", is_agent_active as "isAgentActive",
            custom_prompt_template as "customPromptTemplate", profession,
            plan_id as "planId", minutes_included as "minutesIncluded",
            minutes_remaining as "minutesRemaining", minutes_consumed as "minutesConsumed",
            date_renouvellement as "dateRenouvellement",
            registration_date as "registrationDate", created_at as "createdAt"
          FROM users WHERE id = $1`,
          [userId]
        );

        if (userResult.rows.length === 0) {
          return null;
        }

        const callsResult = await pool.query(
          'SELECT COUNT(*) as count FROM calls WHERE user_id = $1',
          [userId]
        );

        const paymentsResult = await pool.query(
          `SELECT 
            id, user_id as "userId", amount, type, status, date,
            paypal_transaction_id as "paypalTransactionId"
          FROM payments WHERE user_id = $1 ORDER BY date DESC`,
          [userId]
        );

        return {
          ...userResult.rows[0],
          totalCalls: parseInt(callsResult.rows[0].count, 10),
          paymentHistory: paymentsResult.rows,
        };
      } catch (error) {
        console.error('[DB] Error getting user details:', error);
        throw error;
      }
    },

    delete: async (id: string): Promise<void> => {
      console.log('[DB] Deleting user:', id);
      const pool = getPool();
      
      try {
        await pool.query('DELETE FROM payments WHERE user_id = $1', [id]);
        await pool.query('DELETE FROM calls WHERE user_id = $1', [id]);
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        
        console.log('[DB] User and related data deleted successfully');
      } catch (error) {
        console.error('[DB] Error deleting user:', error);
        throw error;
      }
    },
  },
  
  calls: {
    findById: async (id: string): Promise<DBCall | null> => {
      console.log('[DB] Finding call by id:', id);
      const pool = getPool();
      
      try {
        const result = await pool.query(
          `SELECT 
            id, user_id as "userId", vapi_call_id as "vapiCallId",
            caller_name as "callerName", caller_number as "callerNumber",
            timestamp, duration, duration_seconds as "durationSeconds", status,
            summary, transcription, audio_url as "audioUrl",
            gcs_recording_url as "gcsRecordingUrl", vapi_cost as "vapiCost"
          FROM calls WHERE id = $1`,
          [id]
        );
        
        return result.rows[0] || null;
      } catch (error) {
        console.error('[DB] Error finding call by id:', error);
        throw error;
      }
    },
    
    findByUserId: async (userId: string): Promise<DBCall[]> => {
      console.log('[DB] Finding calls by user id:', userId);
      const pool = getPool();
      
      try {
        const result = await pool.query(
          `SELECT 
            id, user_id as "userId", vapi_call_id as "vapiCallId",
            caller_name as "callerName", caller_number as "callerNumber",
            timestamp, duration, duration_seconds as "durationSeconds", status,
            summary, transcription, audio_url as "audioUrl",
            gcs_recording_url as "gcsRecordingUrl", vapi_cost as "vapiCost"
          FROM calls WHERE user_id = $1 ORDER BY timestamp DESC`,
          [userId]
        );
        
        return result.rows;
      } catch (error) {
        console.error('[DB] Error finding calls by user id:', error);
        throw error;
      }
    },
    
    create: async (call: Omit<DBCall, 'id'>): Promise<DBCall> => {
      console.log('[DB] Creating call for user:', call.userId);
      const pool = getPool();
      
      try {
        const result = await pool.query(
          `INSERT INTO calls (
            user_id, vapi_call_id, caller_name, caller_number,
            duration, duration_seconds, status, summary, transcription,
            audio_url, gcs_recording_url, vapi_cost
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING 
            id, user_id as "userId", vapi_call_id as "vapiCallId",
            caller_name as "callerName", caller_number as "callerNumber",
            timestamp, duration, duration_seconds as "durationSeconds", status,
            summary, transcription, audio_url as "audioUrl",
            gcs_recording_url as "gcsRecordingUrl", vapi_cost as "vapiCost"`,
          [
            call.userId, call.vapiCallId, call.callerName, call.callerNumber,
            call.duration || 0, call.durationSeconds || 0, call.status || 'completed',
            call.summary, call.transcription, call.audioUrl, call.gcsRecordingUrl,
            call.vapiCost || 0
          ]
        );
        
        return result.rows[0];
      } catch (error) {
        console.error('[DB] Error creating call:', error);
        throw error;
      }
    },
    
    update: async (id: string, updates: Partial<DBCall>): Promise<DBCall> => {
      console.log('[DB] Updating call:', id);
      const pool = getPool();
      
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const fieldMap: Record<string, string> = {
        userId: 'user_id',
        vapiCallId: 'vapi_call_id',
        callerName: 'caller_name',
        callerNumber: 'caller_number',
        duration: 'duration',
        durationSeconds: 'duration_seconds',
        status: 'status',
        summary: 'summary',
        transcription: 'transcription',
        audioUrl: 'audio_url',
        gcsRecordingUrl: 'gcs_recording_url',
        vapiCost: 'vapi_cost',
      };

      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'timestamp' && fieldMap[key]) {
          fields.push(`${fieldMap[key]} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (fields.length === 0) {
        return await db.calls.findById(id) as DBCall;
      }

      values.push(id);

      try {
        const result = await pool.query(
          `UPDATE calls SET ${fields.join(', ')}
          WHERE id = ${paramIndex}
          RETURNING 
            id, user_id as "userId", vapi_call_id as "vapiCallId",
            caller_name as "callerName", caller_number as "callerNumber",
            timestamp, duration, duration_seconds as "durationSeconds", status,
            summary, transcription, audio_url as "audioUrl",
            gcs_recording_url as "gcsRecordingUrl", vapi_cost as "vapiCost"`,
          values
        );

        if (result.rows.length === 0) {
          throw new Error('Call not found');
        }

        return result.rows[0];
      } catch (error) {
        console.error('[DB] Error updating call:', error);
        throw error;
      }
    },
    
    getAll: async (): Promise<DBCall[]> => {
      console.log('[DB] Getting all calls');
      const pool = getPool();
      
      try {
        const result = await pool.query(
          `SELECT 
            id, user_id as "userId", vapi_call_id as "vapiCallId",
            caller_name as "callerName", caller_number as "callerNumber",
            timestamp, duration, duration_seconds as "durationSeconds", status,
            summary, transcription, audio_url as "audioUrl",
            gcs_recording_url as "gcsRecordingUrl"
          FROM calls ORDER BY timestamp DESC`
        );
        
        return result.rows;
      } catch (error) {
        console.error('[DB] Error getting all calls:', error);
        throw error;
      }
    },
    
    getTotalMinutesConsumed: async (): Promise<number> => {
      console.log('[DB] Getting total minutes consumed');
      const pool = getPool();
      
      try {
        const result = await pool.query(
          'SELECT COALESCE(SUM(CEIL(duration_seconds::decimal / 60)), 0) as total FROM calls'
        );
        
        return parseFloat(result.rows[0].total);
      } catch (error) {
        console.error('[DB] Error getting total minutes consumed:', error);
        throw error;
      }
    },
    
    getMonthlyMinutesConsumed: async (year: number, month: number): Promise<number> => {
      console.log('[DB] Getting monthly minutes consumed for:', year, month);
      const pool = getPool();
      
      try {
        const result = await pool.query(
          `SELECT COALESCE(SUM(CEIL(duration_seconds::decimal / 60)), 0) as total
          FROM calls
          WHERE EXTRACT(YEAR FROM timestamp) = $1
          AND EXTRACT(MONTH FROM timestamp) = $2`,
          [year, month + 1]
        );
        
        return parseFloat(result.rows[0].total);
      } catch (error) {
        console.error('[DB] Error getting monthly minutes consumed:', error);
        throw error;
      }
    },
    
    countByUserId: async (userId: string): Promise<number> => {
      console.log('[DB] Counting calls for user:', userId);
      const pool = getPool();
      
      try {
        const result = await pool.query(
          'SELECT COUNT(*) as count FROM calls WHERE user_id = $1',
          [userId]
        );
        
        return parseInt(result.rows[0].count, 10);
      } catch (error) {
        console.error('[DB] Error counting calls by user id:', error);
        throw error;
      }
    },
  },
  
  stats: {
    getDashboardStats: async (): Promise<DashboardStats> => {
      console.log('[DB] Getting dashboard stats');
      const pool = getPool();
      
      try {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        const [
          totalUsersResult,
          activeUsersResult,
          inactiveUsersResult,
          totalCallsResult,
          totalMinutesResult,
          monthlyMinutesResult,
          currentMonthRevenueResult,
          previousMonthRevenueResult,
        ] = await Promise.all([
          pool.query('SELECT COUNT(*) as count FROM users'),
          pool.query('SELECT COUNT(*) as count FROM users WHERE is_agent_active = true'),
          pool.query('SELECT COUNT(*) as count FROM users WHERE is_agent_active = false'),
          pool.query('SELECT COUNT(*) as count FROM calls'),
          pool.query('SELECT COALESCE(SUM(CEIL(duration_seconds::decimal / 60)), 0) as total FROM calls'),
          pool.query(
            `SELECT COALESCE(SUM(CEIL(duration_seconds::decimal / 60)), 0) as total
            FROM calls
            WHERE EXTRACT(YEAR FROM timestamp) = $1
            AND EXTRACT(MONTH FROM timestamp) = $2`,
            [currentYear, currentMonth + 1]
          ),
          pool.query(
            `SELECT COALESCE(SUM(amount), 0) as total
            FROM payments
            WHERE EXTRACT(YEAR FROM date) = $1
            AND EXTRACT(MONTH FROM date) = $2
            AND status = 'completed'`,
            [currentYear, currentMonth + 1]
          ),
          pool.query(
            `SELECT COALESCE(SUM(amount), 0) as total
            FROM payments
            WHERE EXTRACT(YEAR FROM date) = $1
            AND EXTRACT(MONTH FROM date) = $2
            AND status = 'completed'`,
            [previousYear, previousMonth + 1]
          ),
        ]);

        return {
          totalUsers: parseInt(totalUsersResult.rows[0].count, 10),
          activeUsers: parseInt(activeUsersResult.rows[0].count, 10),
          inactiveUsers: parseInt(inactiveUsersResult.rows[0].count, 10),
          totalCalls: parseInt(totalCallsResult.rows[0].count, 10),
          totalMinutesConsumed: parseFloat(totalMinutesResult.rows[0].total),
          monthlyMinutesConsumed: parseFloat(monthlyMinutesResult.rows[0].total),
          currentMonthRevenue: parseFloat(currentMonthRevenueResult.rows[0].total),
          previousMonthRevenue: parseFloat(previousMonthRevenueResult.rows[0].total),
        };
      } catch (error) {
        console.error('[DB] Error getting dashboard stats:', error);
        throw error;
      }
    },
  },

  payments: {
    create: async (payment: Omit<PaymentRecord, 'id'>): Promise<PaymentRecord> => {
      console.log('[DB] Creating payment for user:', payment.userId);
      const pool = getPool();
      
      try {
        const result = await pool.query(
          `INSERT INTO payments (user_id, amount, type, status, paypal_transaction_id)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING 
            id, user_id as "userId", amount, type, status, date,
            paypal_transaction_id as "paypalTransactionId"`,
          [payment.userId, payment.amount, payment.type, payment.status, payment.paypalTransactionId]
        );
        
        return result.rows[0];
      } catch (error) {
        console.error('[DB] Error creating payment:', error);
        throw error;
      }
    },

    findByUserId: async (userId: string): Promise<PaymentRecord[]> => {
      console.log('[DB] Finding payments for user:', userId);
      const pool = getPool();
      
      try {
        const result = await pool.query(
          `SELECT 
            id, user_id as "userId", amount, type, status, date,
            paypal_transaction_id as "paypalTransactionId"
          FROM payments WHERE user_id = $1 ORDER BY date DESC`,
          [userId]
        );
        
        return result.rows;
      } catch (error) {
        console.error('[DB] Error finding payments by user id:', error);
        throw error;
      }
    },
  },
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[DB] Pool PostgreSQL fermé');
  }
};
