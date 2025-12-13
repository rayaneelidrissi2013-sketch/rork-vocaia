import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { db, getPool } from '@/backend/utils/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

function extractCountryCode(phoneNumber: string): string {
  const phoneClean = phoneNumber.replace(/[^\d+]/g, '');
  
  if (phoneClean.startsWith('+33')) return '+33';
  if (phoneClean.startsWith('+32')) return '+32';
  if (phoneClean.startsWith('+41')) return '+41';
  if (phoneClean.startsWith('+1')) return '+1';
  if (phoneClean.startsWith('+352')) return '+352';
  if (phoneClean.startsWith('+44')) return '+44';
  if (phoneClean.startsWith('+49')) return '+49';
  if (phoneClean.startsWith('+39')) return '+39';
  if (phoneClean.startsWith('+34')) return '+34';
  if (phoneClean.startsWith('+351')) return '+351';
  if (phoneClean.startsWith('+31')) return '+31';
  if (phoneClean.startsWith('+212')) return '+212';
  if (phoneClean.startsWith('+213')) return '+213';
  if (phoneClean.startsWith('+216')) return '+216';
  if (phoneClean.startsWith('+225')) return '+225';
  if (phoneClean.startsWith('+221')) return '+221';
  if (phoneClean.startsWith('+237')) return '+237';
  
  return '+33';
}

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
      console.log('[REGISTER] Step 0: Checking if phone number was verified');
      const pool = getPool();
      const verificationResult = await pool.query(
        `SELECT verified FROM sms_verifications 
         WHERE phone_number = $1 AND verified = true 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [input.phoneNumber]
      );
      
      if (verificationResult.rows.length === 0) {
        console.log('[REGISTER] Phone number not verified:', input.phoneNumber);
        throw new Error('Vous devez v\u00e9rifier votre num\u00e9ro de t\u00e9l\u00e9phone avant de vous inscrire');
      }
      console.log('[REGISTER] Phone number verified successfully');
      
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
      
      const countryCode = extractCountryCode(input.phoneNumber);
      console.log('[REGISTER] Step 6: Country code detected:', countryCode);
      
      const virtualNumberResult = await pool.query(
        `SELECT id, phone_number FROM virtual_numbers 
         WHERE country_code = $1 
         AND assigned_user_id IS NULL
         LIMIT 1`,
        [countryCode]
      );
      
      let virtualNumber: string;
      let virtualNumberId: string | null = null;
      
      if (virtualNumberResult.rows.length > 0) {
        virtualNumber = virtualNumberResult.rows[0].phone_number;
        virtualNumberId = virtualNumberResult.rows[0].id;
        console.log('[REGISTER] Step 7: Virtual number found for country', countryCode, ':', virtualNumber);
      } else {
        console.warn('[REGISTER] No virtual number available for country:', countryCode);
        virtualNumber = '+16072953560';
        console.log('[REGISTER] Step 7: Using default virtual number:', virtualNumber);
      }

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

      console.log('[REGISTER] Step 9: Checking if user with this phone already had free plan...');
      const existingFreeUserResult = await pool.query(
        `SELECT id FROM users WHERE phone_number = $1`,
        [input.phoneNumber]
      );
      
      if (existingFreeUserResult.rows.length > 0) {
        console.log('[REGISTER] User with this phone number already exists, cannot use free plan again');
        throw new Error('Ce numéro de téléphone a déjà été utilisé. Vous ne pouvez pas bénéficier du plan gratuit plusieurs fois.');
      }
      
      console.log('[REGISTER] Step 10: Creating user in database...');
      const newUser = await db.users.create(userData);
      
      if (virtualNumberId) {
        console.log('[REGISTER] Step 11: Assigning virtual number to user...');
        await pool.query(
          `UPDATE virtual_numbers SET assigned_user_id = $1 WHERE id = $2`,
          [newUser.id, virtualNumberId]
        );
        console.log('[REGISTER] Virtual number assigned successfully');
      }

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
