import { storage } from "./storage";
import type { InsertEmailLog } from "@shared/schema";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  userId?: string;
  emailType: InsertEmailLog["emailType"];
  relatedApplicationId?: string;
  relatedLoanId?: string;
  metadata?: Record<string, any>;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  demoMode: boolean;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "Sequel Investments <noreply@fundwithsequel.com>";
const PORTAL_URL = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
  : process.env.PORTAL_URL || "http://localhost:5000";

export function getPortalUrl(): string {
  return PORTAL_URL;
}

export function isDemoMode(): boolean {
  return !RESEND_API_KEY;
}

async function sendViaResend(options: SendEmailOptions): Promise<EmailResult> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Resend API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
      demoMode: false,
    };
  } catch (error: any) {
    console.error("Resend API error:", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
      demoMode: false,
    };
  }
}

function logEmailToConsole(options: SendEmailOptions): void {
  console.log("\n" + "=".repeat(60));
  console.log("📧 EMAIL (DEMO MODE - No API Key Configured)");
  console.log("=".repeat(60));
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Type: ${options.emailType}`);
  if (options.relatedApplicationId) {
    console.log(`Application ID: ${options.relatedApplicationId}`);
  }
  if (options.relatedLoanId) {
    console.log(`Loan ID: ${options.relatedLoanId}`);
  }
  console.log("-".repeat(60));
  console.log("Text Preview:");
  console.log(options.text || "(HTML only)");
  console.log("=".repeat(60) + "\n");
}

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const demoMode = isDemoMode();
  let result: EmailResult;

  if (demoMode) {
    logEmailToConsole(options);
    result = {
      success: true,
      messageId: `demo-${Date.now()}`,
      demoMode: true,
    };
  } else {
    result = await sendViaResend(options);
  }

  try {
    await storage.createEmailLog({
      recipientEmail: options.to,
      recipientUserId: options.userId || null,
      subject: options.subject,
      emailType: options.emailType,
      status: demoMode ? "demo" : (result.success ? "sent" : "failed"),
      errorMessage: result.error || null,
      relatedApplicationId: options.relatedApplicationId || null,
      relatedLoanId: options.relatedLoanId || null,
      metadata: {
        ...options.metadata,
        messageId: result.messageId,
        demoMode,
      },
    });
  } catch (logError) {
    console.error("Failed to log email:", logError);
  }

  return result;
}

export async function shouldSendEmail(userId: string): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    if (!user) return false;
    return user.emailNotificationsEnabled !== false;
  } catch (error) {
    console.error("Error checking email preferences:", error);
    return false;
  }
}

export { emailTemplates } from "./email-templates";
