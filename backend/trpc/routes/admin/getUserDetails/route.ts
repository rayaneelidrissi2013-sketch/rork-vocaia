import { protectedProcedure } from '../../../create-context.js';
import { z } from 'zod';
import { mockCalls } from '../../../../mocks/data.js';
import type { UserDetails } from '../../../../types/index.js';

export default protectedProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    console.log('[tRPC] Getting user details:', input.userId);
    
    const userDetails: UserDetails = {
      id: input.userId,
      email: 'user@example.com',
      name: 'John Doe',
      phoneNumber: '+33 6 12 34 56 78',
      language: 'fr',
      timezone: 'Europe/Paris',
      role: 'user',
      vapiAgentId: undefined,
      vapiPhoneNumber: undefined,
      userPersonalPhone: '+33 6 12 34 56 78',
      isAgentActive: true,
      customPromptTemplate: undefined,
      profession: 'Entrepreneur',
      planId: 'pro',
      minutesIncluded: 350,
      minutesRemaining: 245,
      minutesConsumed: 105,
      dateRenouvellement: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      registrationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      totalCalls: mockCalls.length,
      paymentHistory: [],
    };
    
    return userDetails;
  });
