import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { loanApplications, timelineEvents } from '@shared/schema';
import { eq } from 'drizzle-orm';

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
      await db.update(loanApplications)
        .set(updateData)
        .where(eq(loanApplications.id, applicationId));

      const feeLabels: Record<string, string> = {
        application_fee: 'Application Fee',
        commitment_fee: 'Commitment Fee',
        appraisal_fee: 'Appraisal Fee',
      };

      await db.insert(timelineEvents).values({
        applicationId,
        eventType: 'payment_received',
        title: `${feeLabels[feeType] || 'Fee'} Payment Received`,
        description: `Payment of ${(updateData.paidAmount / 100).toFixed(2)} completed successfully.`,
        metadata: { feeType, paymentIntent: session.payment_intent },
      });

      console.log(`Successfully updated application ${applicationId} with payment status`);
    } catch (error) {
      console.error('Failed to update application payment status:', error);
    }
  }
}
