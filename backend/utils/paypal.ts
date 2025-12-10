const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

interface PayPalAccessToken {
  access_token: string;
  expires_in: number;
}

let cachedAccessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiry) {
    return cachedAccessToken;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

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
    throw new Error(`PayPal auth failed: ${response.statusText}`);
  }

  const data = (await response.json()) as PayPalAccessToken;
  cachedAccessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return cachedAccessToken;
}

export async function createSubscription(
  planId: string,
  userId: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ id: string; approvalUrl: string }> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: userId,
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: 'VocaIA',
        user_action: 'SUBSCRIBE_NOW',
      },
    }),
  });

  interface PayPalSubscriptionResponse {
    id: string;
    links: Array<{ rel: string; href: string }>;
  }
  
  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal subscription creation failed:', error);
    throw new Error('Failed to create subscription');
  }

  const data = await response.json() as PayPalSubscriptionResponse;
  const approvalUrl = data.links.find((link) => link.rel === 'approve')?.href || '';

  return {
    id: data.id,
    approvalUrl,
  };
}

export async function getSubscriptionDetails(subscriptionId: string) {
  const accessToken = await getAccessToken();

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

  interface PayPalCaptureResponse {
    id: string;
    status: string;
  }
  
  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal overage charge failed:', error);
    throw new Error('Failed to charge overage');
  }

  const data = await response.json() as PayPalCaptureResponse;
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
