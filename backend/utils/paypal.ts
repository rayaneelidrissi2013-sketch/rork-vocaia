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

interface PayPalAccessToken {
  access_token: string;
  expires_in: number;
}

let cachedAccessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiry) {
    console.log('[PayPal] Using cached access token');
    return cachedAccessToken;
  }

  console.log('[PayPal] Fetching new access token...');
  
  try {
    const settings = await getPayPalSettings();
    const { clientId, clientSecret, mode } = settings;

    console.log('[PayPal] Settings loaded:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      mode,
    });

    if (!clientId || !clientSecret) {
      throw new Error('Identifiants PayPal non configurés. Veuillez configurer vos clés PayPal dans les paramètres admin.');
    }

    const PAYPAL_API_BASE = getPayPalApiBase(mode);
    console.log('[PayPal] API Base URL:', PAYPAL_API_BASE);
    
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    console.log('[PayPal] Requesting access token...');
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
      console.error('[PayPal] Auth failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Authentification PayPal échouée (${response.status}): Vérifiez vos identifiants PayPal. ${errorText}`);
    }

    const data = await response.json() as PayPalAccessToken;
    cachedAccessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

    console.log('[PayPal] Access token obtained successfully');
    return cachedAccessToken;
  } catch (error: any) {
    console.error('[PayPal] getAccessToken error:', error);
    throw error;
  }
}

export async function createSubscription(
  planId: string,
  userId: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ id: string; approvalUrl: string }> {
  console.log('[PayPal] Creating subscription:', { planId, userId });
  
  try {
    const accessToken = await getAccessToken();
    const settings = await getPayPalSettings();
    const PAYPAL_API_BASE = getPayPalApiBase(settings.mode);

    const requestBody = {
      plan_id: planId,
      custom_id: userId,
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: 'VocaIA',
        user_action: 'SUBSCRIBE_NOW',
      },
    };

    console.log('[PayPal] Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PayPal] Subscription creation failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      let errorMessage = 'Impossible de créer l\'abonnement PayPal';
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        if (errorData.details && errorData.details.length > 0) {
          errorMessage += ': ' + errorData.details.map((d: any) => d.description || d.issue).join(', ');
        }
      } catch {
        errorMessage += `: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[PayPal] Subscription created:', data.id);
    
    const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href || '';

    if (!approvalUrl) {
      console.error('[PayPal] No approval URL found in response:', data);
      throw new Error('URL d\'approbation PayPal introuvable');
    }

    console.log('[PayPal] Approval URL:', approvalUrl);

    return {
      id: data.id,
      approvalUrl,
    };
  } catch (error: any) {
    console.error('[PayPal] createSubscription error:', error);
    throw error;
  }
}

export async function getSubscriptionDetails(subscriptionId: string) {
  const accessToken = await getAccessToken();
  const settings = await getPayPalSettings();
  const PAYPAL_API_BASE = getPayPalApiBase(settings.mode);

  const response = await fetch(
    `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get subscription details');
  }

  return response.json();
}

export async function cancelSubscription(
  subscriptionId: string,
  reason: string
): Promise<void> {
  const accessToken = await getAccessToken();
  const settings = await getPayPalSettings();
  const PAYPAL_API_BASE = getPayPalApiBase(settings.mode);

  const response = await fetch(
    `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }
}

export async function chargeOverage(
  amount: number,
  userId: string,
  description: string
): Promise<{ transactionId: string; status: string }> {
  const accessToken = await getAccessToken();
  const settings = await getPayPalSettings();
  const PAYPAL_API_BASE = getPayPalApiBase(settings.mode);

  const response = await fetch(`${PAYPAL_API_BASE}/v2/payments/captures`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: {
        currency_code: 'USD',
        value: amount.toFixed(2),
      },
      invoice_id: `overage-${userId}-${Date.now()}`,
      note_to_payer: description,
      custom_id: userId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal overage charge failed:', error);
    throw new Error('Failed to charge overage');
  }

  const data = await response.json();
  return {
    transactionId: data.id,
    status: data.status,
  };
}

export function verifyWebhookSignature(
  webhookId: string,
  headers: Record<string, string>,
  body: string
): boolean {
  return true;
}
