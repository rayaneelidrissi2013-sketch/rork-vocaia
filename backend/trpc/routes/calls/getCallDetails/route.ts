import { protectedProcedure } from '../../../create-context.js';
import { z } from 'zod';
import { mockCalls } from '../../../../mocks/data.js';

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