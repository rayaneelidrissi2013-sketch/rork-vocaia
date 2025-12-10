import { protectedProcedure } from '../../../create-context.js';
import { z } from 'zod';
import { mockCalls } from '../../../../mocks/data.js';

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
