import { protectedProcedure } from '@/backend/trpc/create-context';

export default protectedProcedure
  .query(async () => {
    console.log('[tRPC] Getting referral stats');
    
    return {
      referralCode: 'VOCAIA2024',
      referredCount: 3,
      bonusMinutes: 15,
    };
  });
