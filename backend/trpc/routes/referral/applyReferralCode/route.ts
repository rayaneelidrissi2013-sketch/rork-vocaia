import { protectedProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';

export default protectedProcedure
  .input(z.object({
    referralCode: z.string(),
    newUserId: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[tRPC] Applying referral code:', input.referralCode, 'for user:', input.newUserId);
    
    return {
      success: true,
      bonusMinutesGranted: 5,
    };
  });
