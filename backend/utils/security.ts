import crypto from 'crypto';

export function verifyVapiWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying Vapi webhook signature:', error);
    return false;
  }
}

export function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}
