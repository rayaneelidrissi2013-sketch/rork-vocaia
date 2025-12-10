import { protectedProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { mockCalls } from '@/mocks/data';

export default protectedProcedure
  .input(z.object({
    callId: z.string(),
  }))
  .query(async ({ input }) => {
    console.log('[tRPC] Getting call details:', input.callId);
    
    const call = mockCalls.find(c => c.id === input.callId);
    
    if (!call) {
      throw new Error('Call not found');
    }
    
    return call;
  });