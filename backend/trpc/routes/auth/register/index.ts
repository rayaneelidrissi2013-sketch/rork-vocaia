import { publicProcedure } from '../../../create-context.js';
import { z } from 'zod';

export const registerProcedure = publicProcedure
  .input(
    z.object({
      email: z.string(),
      name: z.string(),
      phoneNumber: z.string(),
      language: z.string(),
      timezone: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[REGISTER TEST]', input.email);

    return {
      success: true,
      user: {
        id: 'test-id',
        email: input.email,
        name: input.name,
        phoneNumber: input.phoneNumber,
        language: input.language,
        timezone: input.timezone,
        createdAt: new Date().toISOString(),
        role: 'user',
      },
    };
  });
