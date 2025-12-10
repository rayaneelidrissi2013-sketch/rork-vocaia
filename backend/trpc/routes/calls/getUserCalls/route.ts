import { protectedProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { mockCalls } from '@/mocks/data';

export default protectedProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    console.log('[tRPC] Getting user calls:', input.userId);
    
    return {
      calls: mockCalls,
    };
  });
