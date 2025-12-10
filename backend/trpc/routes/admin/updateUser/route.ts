import { publicProcedure } from '../../../create-context.js';
import { Pool } from 'pg';
import { z } from 'zod';

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

const updateUserSchema = z.object({
  userId: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  profession: z.string().optional(),
  planId: z.string().optional(),
});

export const updateUserProcedure = publicProcedure
  .input(updateUserSchema)
  .mutation(async ({ input }) => {
    try {
      console.log('[tRPC updateUser] Updating user:', input.userId);

      const updates: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (input.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(input.name);
      }

      if (input.email !== undefined) {
        updates.push(`email = $${paramIndex++}`);
        values.push(input.email);
      }

      if (input.phoneNumber !== undefined) {
        updates.push(`phone_number = $${paramIndex++}`);
        values.push(input.phoneNumber);
      }

      if (input.profession !== undefined) {
        updates.push(`profession = $${paramIndex++}`);
        values.push(input.profession);
      }

      if (input.planId !== undefined) {
        updates.push(`plan_id = $${paramIndex++}`);
        values.push(input.planId);

        const minutesMap: Record<string, number> = {
          'free': 1,
          'essentiel': 15,
          'pro': 100,
          'expert': 300,
        };

        const minutesIncluded = minutesMap[input.planId] || 0;
        updates.push(`minutes_included = $${paramIndex++}`);
        values.push(minutesIncluded);
        updates.push(`minutes_remaining = $${paramIndex++}`);
        values.push(minutesIncluded);
      }

      if (updates.length === 0) {
        throw new Error('Aucune modification à effectuer');
      }

      values.push(input.userId);

      const query = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const db = getPool();
      const result = await db.query(query, values);

      if (result.rowCount === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      const row = result.rows[0];
      console.log('[tRPC updateUser] User updated successfully');

      return {
        success: true,
        user: JSON.parse(JSON.stringify({
          id: String(row.id),
          name: String(row.name),
          email: String(row.email),
          phoneNumber: String(row.phone_number),
          profession: String(row.profession),
          planId: String(row.plan_id),
          minutesIncluded: Number(row.minutes_included),
          minutesRemaining: Number(row.minutes_remaining),
        })),
      };
    } catch (error) {
      console.error('[tRPC updateUser] Error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Impossible de modifier l\'utilisateur'
      );
    }
  });
