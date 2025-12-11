import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { db } from '@/backend/utils/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const registerProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      name: z.string(),
      phoneNumber: z.string(),
      language: z.string().default('fr'),
      timezone: z.string().default('Europe/Paris'),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[REGISTER] Starting registration for:', input.email);

    try {
      console.log('[REGISTER] Step 1: Checking if user exists');
      const existingUser = await db.users.findByEmail(input.email);
      if (existingUser) {
        console.log('[REGISTER] User already exists:', input.email);
        throw new Error('USER_ALREADY_EXISTS');
      }
      console.log('[REGISTER] Step 2: User does not exist, proceeding with registration');

      const tempPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      console.log('[REGISTER] Step 3: Password hashed successfully');

      const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      console.log('[REGISTER] Step 4: Referral code generated:', referralCode);

      const userData = {
        email: input.email,
        name: input.name,
        phoneNumber: input.phoneNumber,
        language: input.language,
        timezone: input.timezone,
        role: 'user' as const,
        passwordHash,
        referralCode,
        vapiAgentId: undefined,
        vapiPhoneNumber: undefined,
        userPersonalPhone: input.phoneNumber,
        isAgentActive: false,
        customPromptTemplate: undefined,
        profession: undefined,
        planId: 'gratuit',
        minutesIncluded: 5,
        minutesRemaining: 5,
        minutesConsumed: 0,
        dateRenouvellement: undefined,
        referredByCode: undefined,
        bonusMinutes: 0,
        referralCount: 0,
      };
      console.log('[REGISTER] Step 5: User data prepared:', JSON.stringify(userData, null, 2));

      console.log('[REGISTER] Step 6: Creating user in database...');
      const newUser = await db.users.create(userData);

      console.log('[REGISTER] User created successfully:', newUser.id);

      return {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          phoneNumber: newUser.phoneNumber,
          language: newUser.language,
          timezone: newUser.timezone,
          role: newUser.role,
          createdAt: newUser.createdAt,
          referralCode: newUser.referralCode,
        },
      };
    } catch (error: any) {
      console.error('[REGISTER] Error:', error);
      
      if (error.message === 'USER_ALREADY_EXISTS') {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      
      throw new Error('Erreur lors de l\'inscription');
    }
  });
