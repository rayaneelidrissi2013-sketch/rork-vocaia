import { protectedProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';

export default protectedProcedure
  .input(z.object({
    planId: z.string(),
    userId: z.string(),
    returnUrl: z.string(),
    cancelUrl: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[tRPC] Creating subscription (mock):', input);
    
    return {
      success: true,
      subscriptionId: 'mock-subscription-' + Date.now(),
      approvalUrl: input.returnUrl,
    };
  });
