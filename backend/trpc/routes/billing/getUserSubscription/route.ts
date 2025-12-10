import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';

export default protectedProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    console.log('[tRPC] getUserSubscription called for:', input.userId);
    
    const mockPlan = SUBSCRIPTION_PLANS[0];
    
    return {
      planId: mockPlan.id,
      planName: mockPlan.name,
      minutesIncluded: mockPlan.minutesIncluded,
      minutesRemaining: Math.floor(mockPlan.minutesIncluded * 0.7),
      minutesConsumed: Math.floor(mockPlan.minutesIncluded * 0.3),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });