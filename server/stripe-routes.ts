import { Router, Request, Response } from 'express';
import { getUncachableStripeClient, getStripePublishableKey } from './stripeClient';
import { db } from './db';
import { loanApplications } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// Get publishable key for frontend
router.get('/publishable-key', async (req: Request, res: Response) => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey });
  } catch (error) {
    console.error('Error getting publishable key:', error);
    res.status(500).json({ error: 'Failed to get publishable key' });
  }
});

// List available fee products from Stripe
router.get('/products', async (req: Request, res: Response) => {
  try {
    const result = await db.execute(
      sql`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency
        FROM stripe.products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = true
        ORDER BY p.name
      `
    );

    // Group by product
    const productsMap = new Map<string, any>();
    for (const row of result.rows as any[]) {
      if (!productsMap.has(row.product_id)) {
        productsMap.set(row.product_id, {
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          metadata: row.product_metadata,
          prices: []
        });
      }
      if (row.price_id) {
        productsMap.get(row.product_id).prices.push({
          id: row.price_id,
          unit_amount: row.unit_amount,
          currency: row.currency,
        });
      }
    }

    res.json({ products: Array.from(productsMap.values()) });
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({ error: 'Failed to list products' });
  }
});

// Create checkout session for a fee
router.post('/checkout', async (req: any, res: Response) => {
  try {
    const { applicationId, feeType } = req.body;
    
    if (!applicationId || !feeType) {
      return res.status(400).json({ error: 'applicationId and feeType are required' });
    }

    const validFeeTypes = ['application_fee', 'commitment_fee', 'appraisal_fee'];
    if (!validFeeTypes.includes(feeType)) {
      return res.status(400).json({ error: 'Invalid fee type' });
    }

    // Get the application
    const [application] = await db.select().from(loanApplications).where(eq(loanApplications.id, applicationId));
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if already paid
    const paidField = feeType === 'application_fee' ? 'applicationFeePaid' :
                      feeType === 'commitment_fee' ? 'commitmentFeePaid' : 'appraisalFeePaid';
    if (application[paidField as keyof typeof application]) {
      return res.status(400).json({ error: 'This fee has already been paid' });
    }

    // Find the product and price for this fee type from Stripe schema
    const productResult = await db.execute(
      sql`
        SELECT p.id as product_id, p.name, pr.id as price_id, pr.unit_amount
        FROM stripe.products p
        JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = true 
        AND p.metadata->>'feeType' = ${feeType}
        LIMIT 1
      `
    );

    if (!productResult.rows || productResult.rows.length === 0) {
      return res.status(404).json({ error: `No product found for fee type: ${feeType}. Please run the seed script.` });
    }

    const product = productResult.rows[0] as { product_id: string; name: string; price_id: string; unit_amount: number };

    const stripe = await getUncachableStripeClient();

    // Create or get customer
    let customerId = application.stripeCustomerId;
    if (!customerId) {
      // Get user email
      const userResult = await db.execute(
        sql`SELECT email FROM users WHERE id = ${application.userId}`
      );
      const userEmail = (userResult.rows[0] as any)?.email || 'customer@example.com';

      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          applicationId: applicationId,
          userId: application.userId,
        }
      });
      customerId = customer.id;

      // Save customer ID to application
      await db.update(loanApplications)
        .set({ stripeCustomerId: customerId })
        .where(eq(loanApplications.id, applicationId));
    }

    // Build success/cancel URLs
    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const successUrl = `${baseUrl}/portal/application/${applicationId}?payment=success&feeType=${feeType}`;
    const cancelUrl = `${baseUrl}/portal/application/${applicationId}?payment=cancelled`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: product.price_id,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        applicationId,
        feeType,
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Get payment status for an application
router.get('/status/:applicationId', async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;

    const [application] = await db.select({
      applicationFeePaid: loanApplications.applicationFeePaid,
      commitmentFeePaid: loanApplications.commitmentFeePaid,
      appraisalFeePaid: loanApplications.appraisalFeePaid,
    }).from(loanApplications).where(eq(loanApplications.id, applicationId));

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

export default router;
