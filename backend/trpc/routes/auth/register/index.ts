import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { db } from '@/backend/utils/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const registerProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string(),
      phoneNumber: z.string(),
      language: z.string().default('fr'),
      timezone: z.string().default('Europe/Paris'),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[REGISTER] Starting registration for phone:', input.phoneNumber);
    console.log('[REGISTER] Email:', input.email);

    try {
      console.log('[REGISTER] Step 1: Checking if phone number already exists');
      const existingUserByPhone = await db.users.findByPhoneNumber(input.phoneNumber);
      if (existingUserByPhone) {
        console.log('[REGISTER] User already exists with phone number:', input.phoneNumber);
        throw new Error('PHONE_ALREADY_EXISTS');
      }
      
      console.log('[REGISTER] Step 2: Checking if email already exists');
      const existingUserByEmail = await db.users.findByEmail(input.email);
      if (existingUserByEmail) {
        console.log('[REGISTER] User already exists with email:', input.email);
        throw new Error('EMAIL_ALREADY_EXISTS');
      }
      console.log('[REGISTER] Step 3: User does not exist, proceeding with registration');

      const passwordHash = await bcrypt.hash(input.password, 10);
      console.log('[REGISTER] Step 4: Password hashed successfully');

      const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      console.log('[REGISTER] Step 5: Referral code generated:', referralCode);
      
      const countryCode = input.phoneNumber.substring(0, input.phoneNumber.indexOf(' ') > 0 ? input.phoneNumber.indexOf(' ') : 3);
      const virtualNumber = '+16072953560';
      console.log('[REGISTER] Step 6: Country code detected:', countryCode);
      console.log('[REGISTER] Step 7: Assigning virtual number:', virtualNumber);

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
        vapiPhoneNumber: virtualNumber,
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
      console.log('[REGISTER] Step 8: User data prepared:', JSON.stringify(userData, null, 2));

      console.log('[REGISTER] Step 9: Creating user in database...');
      const newUser = await db.users.create(userData);

      console.log('[REGISTER] ✅ User created successfully!');
      console.log('[REGISTER] User ID:', newUser.id);
      console.log('[REGISTER] Phone number:', newUser.phoneNumber);
      console.log('[REGISTER] Virtual number assigned:', newUser.vapiPhoneNumber);
      console.log('[REGISTER] Country code:', countryCode);

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
      console.error('[REGISTER] Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack
      });
      
      if (error.message === 'PHONE_ALREADY_EXISTS') {
        throw new Error('Un utilisateur avec ce numéro de téléphone existe déjà');
      }
      
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      
      if (error.code === '23505') {
        if (error.detail?.includes('phone_number')) {
          throw new Error('Ce numéro de téléphone est déjà utilisé');
        }
        if (error.detail?.includes('email')) {
          throw new Error('Cet email est déjà utilisé');
        }
        throw new Error('Un utilisateur avec ces informations existe déjà');
      }
      
      throw new Error(`Erreur lors de l'inscription: ${error.message || 'Erreur inconnue'}`);
    }
  });
