import { protectedProcedure } from '../../../create-context.js';
import { db } from '../../../../utils/database.js';
import { z } from 'zod';

const deleteUserSchema = z.object({
  userId: z.string(),
});

export const deleteUserProcedure = protectedProcedure
  .input(deleteUserSchema)
  .mutation(async ({ input }) => {
    try {
      console.log('[tRPC] Deleting user:', input.userId);

      const user = await db.users.findById(input.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.vapiAgentId) {
        try {
          const vapiApiKey = process.env.VAPI_SECRET_KEY;
          if (vapiApiKey) {
            console.log('[tRPC] Disabling Vapi agent:', user.vapiAgentId);
            
            await fetch(`https://api.vapi.ai/assistant/${user.vapiAgentId}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${vapiApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                forwardingPhoneNumber: null,
              }),
            });
          }
        } catch (error) {
          console.error('[tRPC] Error disabling Vapi agent:', error);
        }
      }

      await db.users.delete(input.userId);

      console.log('[tRPC] User deleted successfully');

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      console.error('[tRPC] Error deleting user:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete user'
      );
    }
  });
