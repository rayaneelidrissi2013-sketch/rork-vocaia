import { protectedProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { db } from '@/backend/utils/database';

export default protectedProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[tRPC] toggleAgent called for user:', input.userId);
    
    try {
      const user = await db.users.findById(input.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.minutesRemaining <= 0) {
        console.log('[tRPC] Cannot activate agent: No minutes remaining');
        throw new Error('INSUFFICIENT_MINUTES');
      }
      
      const newStatus = !user.isAgentActive;
      
      if (newStatus && user.vapiAgentId && user.userPersonalPhone) {
        const vapiApiKey = process.env.VAPI_SECRET_KEY;
        if (vapiApiKey) {
          console.log('[tRPC] Enabling Vapi forwarding to:', user.userPersonalPhone);
          
          const response = await fetch(`https://api.vapi.ai/assistant/${user.vapiAgentId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${vapiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              forwardingPhoneNumber: user.userPersonalPhone,
            }),
          });
          
          if (!response.ok) {
            console.error('[tRPC] Failed to enable Vapi forwarding:', await response.text());
            throw new Error('Failed to enable forwarding');
          }
        }
      } else if (!newStatus && user.vapiAgentId) {
        const vapiApiKey = process.env.VAPI_SECRET_KEY;
        if (vapiApiKey) {
          console.log('[tRPC] Disabling Vapi forwarding');
          
          const response = await fetch(`https://api.vapi.ai/assistant/${user.vapiAgentId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${vapiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              forwardingPhoneNumber: null,
            }),
          });
          
          if (!response.ok) {
            console.error('[tRPC] Failed to disable Vapi forwarding:', await response.text());
          }
        }
      }
      
      await db.users.update(input.userId, {
        isAgentActive: newStatus,
      });
      
      return {
        success: true,
        isAgentActive: newStatus,
      };
    } catch (error) {
      console.error('[tRPC] Error toggling agent:', error);
      throw error;
    }
  });
