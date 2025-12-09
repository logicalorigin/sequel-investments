import { storage } from "./storage";
import type { InsertSmsLog } from "@shared/schema";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const isTwilioConfigured = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);

export function validatePhoneNumber(phone: string): { valid: boolean; formatted: string } {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return { valid: true, formatted: `+1${cleaned}` };
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return { valid: true, formatted: `+${cleaned}` };
  }
  if (cleaned.length > 10 && cleaned.startsWith('+')) {
    return { valid: true, formatted: phone };
  }
  
  return { valid: false, formatted: phone };
}

export interface SendSMSOptions {
  to: string;
  message: string;
  smsType: InsertSmsLog['smsType'];
  userId?: string;
  applicationId?: string;
  loanId?: string;
}

export async function sendSMS(options: SendSMSOptions): Promise<{ success: boolean; status: 'sent' | 'failed' | 'demo'; error?: string }> {
  const { to, message, smsType, userId, applicationId, loanId } = options;
  
  const validation = validatePhoneNumber(to);
  if (!validation.valid) {
    const error = `Invalid phone number: ${to}`;
    console.error(`SMS Error: ${error}`);
    
    await storage.createSmsLog({
      recipientPhone: to,
      recipientUserId: userId || null,
      message,
      smsType,
      status: 'failed',
      errorMessage: error,
      relatedApplicationId: applicationId || null,
      relatedLoanId: loanId || null,
    });
    
    return { success: false, status: 'failed', error };
  }

  if (!isTwilioConfigured) {
    console.log(`\n📱 SMS (DEMO MODE)`);
    console.log(`   To: ${validation.formatted}`);
    console.log(`   Message: ${message}`);
    console.log(`   Type: ${smsType}\n`);
    
    await storage.createSmsLog({
      recipientPhone: validation.formatted,
      recipientUserId: userId || null,
      message,
      smsType,
      status: 'demo',
      errorMessage: null,
      relatedApplicationId: applicationId || null,
      relatedLoanId: loanId || null,
    });
    
    return { success: true, status: 'demo' };
  }

  try {
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: validation.formatted,
          From: TWILIO_PHONE_NUMBER!,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const error = errorData.message || `Twilio error: ${response.status}`;
      
      await storage.createSmsLog({
        recipientPhone: validation.formatted,
        recipientUserId: userId || null,
        message,
        smsType,
        status: 'failed',
        errorMessage: error,
        relatedApplicationId: applicationId || null,
        relatedLoanId: loanId || null,
      });
      
      console.error(`SMS Error: ${error}`);
      return { success: false, status: 'failed', error };
    }

    await storage.createSmsLog({
      recipientPhone: validation.formatted,
      recipientUserId: userId || null,
      message,
      smsType,
      status: 'sent',
      errorMessage: null,
      relatedApplicationId: applicationId || null,
      relatedLoanId: loanId || null,
    });

    console.log(`SMS sent to ${validation.formatted}`);
    return { success: true, status: 'sent' };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error sending SMS';
    
    await storage.createSmsLog({
      recipientPhone: validation.formatted,
      recipientUserId: userId || null,
      message,
      smsType,
      status: 'failed',
      errorMessage: error,
      relatedApplicationId: applicationId || null,
      relatedLoanId: loanId || null,
    });
    
    console.error(`SMS Error: ${error}`);
    return { success: false, status: 'failed', error };
  }
}

export async function sendSMSIfEnabled(
  userId: string,
  options: Omit<SendSMSOptions, 'to' | 'userId'>
): Promise<boolean> {
  const user = await storage.getUser(userId);
  
  if (!user) {
    console.log(`SMS skipped: User ${userId} not found`);
    return false;
  }
  
  if (!user.smsNotificationsEnabled) {
    console.log(`SMS skipped: User ${user.email} has SMS notifications disabled`);
    return false;
  }
  
  if (!user.phone) {
    console.log(`SMS skipped: User ${user.email} has no phone number`);
    return false;
  }
  
  const result = await sendSMS({
    ...options,
    to: user.phone,
    userId,
  });
  
  return result.success;
}

export function isSMSConfigured(): boolean {
  return isTwilioConfigured;
}
