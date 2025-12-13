import { protectedProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';
import { Pool } from 'pg';

let pool: Pool | null = null;

const getPool = (): Pool => {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL_NOT_CONFIGURED');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  return pool;
};

interface PayPalSettings {
  clientId: string;
  clientSecret: string;
  mode: 'sandbox' | 'live';
}

async function getPayPalSettings(): Promise<PayPalSettings> {
  const db = getPool();
  const result = await db.query(
    `SELECT setting_key, setting_value 
     FROM global_settings 
     WHERE setting_key IN ('paypal_client_id', 'paypal_client_secret', 'paypal_mode')`
  );

  const settings: Record<string, string> = {};
  result.rows.forEach((row: any) => {
    settings[row.setting_key] = row.setting_value;
  });

  return {
    clientId: settings.paypal_client_id || '',
    clientSecret: settings.paypal_client_secret || '',
    mode: (settings.paypal_mode || 'sandbox') as 'sandbox' | 'live',
  };
}

function getPayPalApiBase(mode: 'sandbox' | 'live'): string {
  return mode === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';
}

async function getAccessToken(): Promise<string> {
  console.log('[PayPal] Fetching access token for order capture...');
  
  try {
    const settings = await getPayPalSettings();
    const { clientId, clientSecret, mode } = settings;

    if (!clientId || !clientSecret) {
      throw new Error('Identifiants PayPal non configurés');
    }

    const PAYPAL_API_BASE = getPayPalApiBase(mode);
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PayPal] Auth failed:', errorText);
      throw new Error(`Authentification PayPal échouée: ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error: any) {
    console.error('[PayPal] getAccessToken error:', error);
    throw error;
  }
}

export default protectedProcedure
  .input(z.object({
    orderId: z.string(),
    userId: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[tRPC] Completing PayPal payment:', input);
    
    try {
      const db = getPool();
      const accessToken = await getAccessToken();
      const settings = await getPayPalSettings();
      const PAYPAL_API_BASE = getPayPalApiBase(settings.mode);

      console.log('[PayPal] Capturing order:', input.orderId);
      const captureResponse = await fetch(
        `${PAYPAL_API_BASE}/v2/checkout/orders/${input.orderId}/capture`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!captureResponse.ok) {
        const errorText = await captureResponse.text();
        console.error('[PayPal] Capture failed:', errorText);
        throw new Error(`Capture PayPal échouée: ${errorText}`);
      }

      const captureData = await captureResponse.json();
      console.log('[PayPal] Order captured successfully:', captureData.id);

      const subscriptionResult = await db.query(
        `SELECT us.*, sp.minutes_included 
         FROM user_subscriptions us
         JOIN subscription_plans sp ON us.plan_id = sp.id
         WHERE us.paypal_subscription_id = $1`,
        [input.orderId]
      );

      if (subscriptionResult.rows.length === 0) {
        throw new Error('Subscription not found');
      }

      const subscription = subscriptionResult.rows[0];

      await db.query(
        `UPDATE user_subscriptions 
         SET status = 'active',
             minutes_remaining = $1,
             minutes_used = 0,
             renewal_date = NOW() + INTERVAL '30 days',
             updated_at = NOW()
         WHERE paypal_subscription_id = $2`,
        [subscription.minutes_included, input.orderId]
      );
      
      await db.query(
        `UPDATE users 
         SET plan_id = $1,
             minutes_included = $2,
             minutes_remaining = $2,
             minutes_consumed = 0,
             date_renouvellement = NOW() + INTERVAL '30 days',
             updated_at = NOW()
         WHERE id = $3`,
        [subscription.plan_id, subscription.minutes_included, input.userId]
      );
      
      console.log('[PayPal] User plan updated - old minutes NOT carried over, fresh start with new plan minutes');

      await db.query(
        `UPDATE payments 
         SET status = 'completed',
             updated_at = NOW()
         WHERE paypal_transaction_id = $1`,
        [input.orderId]
      );

      console.log('[tRPC] Subscription activated successfully for user:', input.userId);
      console.log('[tRPC] Plan upgraded - user now has fresh', subscription.minutes_included, 'minutes (old minutes were NOT carried over)');

      return {
        success: true,
        message: 'Abonnement activé avec succès',
        subscription: {
          planId: subscription.plan_id,
          minutesIncluded: subscription.minutes_included,
          minutesRemaining: subscription.minutes_included,
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };
    } catch (error: any) {
      console.error('[tRPC] Error completing PayPal payment:', error);
      throw new Error(error.message || 'Failed to complete PayPal payment');
    }
  });
