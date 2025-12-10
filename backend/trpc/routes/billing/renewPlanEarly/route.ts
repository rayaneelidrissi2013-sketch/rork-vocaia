import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';

const renewPlanEarlyInput = z.object({
  userId: z.string(),
  planId: z.string(),
});

export const renewPlanEarlyProcedure = publicProcedure
  .input(renewPlanEarlyInput)
  .mutation(async ({ input }) => {
    console.log('[renewPlanEarly] Starting early renewal for user:', input.userId, 'plan:', input.planId);
    
    try {
      const subscriptionKey = `user_subscription_mock`;
      const storedSub = await AsyncStorage.getItem(subscriptionKey);
      
      if (!storedSub) {
        throw new Error('No subscription found');
      }
      
      const subscription = JSON.parse(storedSub);
      
      const currentRenewalDate = new Date(subscription.renewalDate);
      const newRenewalDate = new Date(currentRenewalDate);
      newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
      
      const updatedSubscription = {
        ...subscription,
        minutesRemaining: subscription.minutesIncluded,
        renewalDate: newRenewalDate.toISOString(),
        lastRenewed: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(subscriptionKey, JSON.stringify(updatedSubscription));
      
      console.log('[renewPlanEarly] Successfully renewed plan early', {
        planId: input.planId,
        minutesRestored: subscription.minutesIncluded,
        newRenewalDate: newRenewalDate.toISOString(),
      });
      
      return {
        success: true,
        subscription: updatedSubscription,
        message: 'Votre pack a été renouvelé avec succès',
      };
    } catch (error: any) {
      console.error('[renewPlanEarly] Error:', error);
      throw new Error(error.message || 'Impossible de renouveler le pack');
    }
  });

export default renewPlanEarlyProcedure;
