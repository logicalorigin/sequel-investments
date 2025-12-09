import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { loanApplications, applicationTimeline, notifications } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { sendEmail, emailTemplates, shouldSendEmail } from './email';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature, uuid);

    const stripe = await getUncachableStripeClient();
    let event;
    
    try {
      event = JSON.parse(payload.toString());
    } catch (err) {
      console.error('Failed to parse webhook payload:', err);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await this.handleCheckoutComplete(stripe, session);
    }
  }

  static async handleCheckoutComplete(stripe: any, session: any): Promise<void> {
    const applicationId = session.metadata?.applicationId;
    const feeType = session.metadata?.feeType;

    if (!applicationId || !feeType) {
      console.log('Missing applicationId or feeType in checkout session metadata');
      return;
    }

    console.log(`Processing payment for application ${applicationId}, fee type: ${feeType}`);

    const updateData: Record<string, any> = {
      stripePaymentIntentId: session.payment_intent,
      stripePaymentStatus: 'succeeded',
      paidAt: new Date(),
    };

    if (feeType === 'application_fee') {
      updateData.applicationFeePaid = true;
      updateData.paidAmount = 29500;
    } else if (feeType === 'commitment_fee') {
      updateData.commitmentFeePaid = true;
      updateData.paidAmount = 49500;
    } else if (feeType === 'appraisal_fee') {
      updateData.appraisalFeePaid = true;
      updateData.paidAmount = 65000;
    }

    try {
      // Update the loan application
      await db.update(loanApplications)
        .set(updateData)
        .where(eq(loanApplications.id, applicationId));

      // Get application details for notifications
      const [application] = await db.select()
        .from(loanApplications)
        .where(eq(loanApplications.id, applicationId))
        .limit(1);

      const feeLabels: Record<string, string> = {
        application_fee: 'Application Fee',
        commitment_fee: 'Commitment Fee',
        appraisal_fee: 'Appraisal Fee',
      };

      const feeLabel = feeLabels[feeType] || 'Fee';
      const amountFormatted = `$${(updateData.paidAmount / 100).toFixed(2)}`;

      // Add timeline event
      await db.insert(applicationTimeline).values({
        loanApplicationId: applicationId,
        eventType: 'payment_received',
        title: `${feeLabel} Payment Received`,
        description: `Payment of ${amountFormatted} completed successfully.`,
        metadata: { feeType, paymentIntent: session.payment_intent },
      });

      // Create notification for the borrower
      if (application?.userId) {
        await db.insert(notifications).values({
          userId: application.userId,
          type: 'payment',
          title: 'Payment Confirmed',
          message: `Your ${feeLabel} payment of ${amountFormatted} has been successfully processed.`,
          linkUrl: `/portal/application/${applicationId}`,
          relatedApplicationId: applicationId,
          isRead: false,
        });
      }

      // Send confirmation email to borrower
      if (shouldSendEmail() && session.customer_email) {
        try {
          await sendEmail({
            to: session.customer_email,
            subject: `Payment Confirmation - ${feeLabel}`,
            html: emailTemplates.paymentConfirmation({
              borrowerName: session.customer_details?.name || 'Valued Borrower',
              feeType: feeLabel,
              amount: amountFormatted,
              propertyAddress: application?.propertyAddress || undefined,
              applicationId,
            }),
          });
          console.log(`Sent payment confirmation email to ${session.customer_email}`);
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
        }
      }

      console.log(`Successfully updated application ${applicationId} with payment status and notifications`);
    } catch (error) {
      console.error('Failed to update application payment status:', error);
    }
  }
}
