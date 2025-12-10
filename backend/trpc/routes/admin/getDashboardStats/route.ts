import { protectedProcedure } from '../../../create-context.js';
import { mockCalls } from '../../../../mocks/data.js';

export default protectedProcedure
  .query(async () => {
    console.log('[tRPC] Getting dashboard stats');
    
    return {
      totalUsers: 125,
      activeUsers: 98,
      inactiveUsers: 27,
      totalCalls: mockCalls.length,
      totalMinutesConsumed: 2450,
      monthlyMinutesConsumed: 780,
      currentMonthRevenue: 4580,
      previousMonthRevenue: 3890,
    };
  });
