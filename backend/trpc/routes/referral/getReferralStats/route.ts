import { protectedProcedure } from '../../../create-context.js';

export default protectedProcedure
  .query(async () => {
    console.log('[tRPC] Getting referral stats');
    
    return {
      referralCode: 'VOCAIA2024',
      referredCount: 3,
      bonusMinutes: 15,
    };
  });
