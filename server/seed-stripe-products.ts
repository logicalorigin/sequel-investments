import { getUncachableStripeClient } from './stripeClient';

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating Stripe products for loan fees...');

  // Application Fee - $295 one-time
  const applicationFeeProduct = await stripe.products.create({
    name: 'Application Fee',
    description: 'One-time application processing fee for loan applications',
    metadata: {
      feeType: 'application_fee',
      category: 'loan_fees',
    },
  });

  const applicationFeePrice = await stripe.prices.create({
    product: applicationFeeProduct.id,
    unit_amount: 29500, // $295.00
    currency: 'usd',
  });

  console.log(`Created Application Fee: ${applicationFeeProduct.id} with price: ${applicationFeePrice.id}`);

  // Commitment Fee - $495 flat for demo (typically 1% of loan amount)
  const commitmentFeeProduct = await stripe.products.create({
    name: 'Commitment Fee',
    description: 'Commitment fee for loan approval (typically 1% of loan amount)',
    metadata: {
      feeType: 'commitment_fee',
      category: 'loan_fees',
    },
  });

  const commitmentFeePrice = await stripe.prices.create({
    product: commitmentFeeProduct.id,
    unit_amount: 49500, // $495.00 flat for demo
    currency: 'usd',
  });

  console.log(`Created Commitment Fee: ${commitmentFeeProduct.id} with price: ${commitmentFeePrice.id}`);

  // Appraisal Fee - $650 one-time
  const appraisalFeeProduct = await stripe.products.create({
    name: 'Appraisal Fee',
    description: 'Third-party property appraisal fee',
    metadata: {
      feeType: 'appraisal_fee',
      category: 'loan_fees',
    },
  });

  const appraisalFeePrice = await stripe.prices.create({
    product: appraisalFeeProduct.id,
    unit_amount: 65000, // $650.00
    currency: 'usd',
  });

  console.log(`Created Appraisal Fee: ${appraisalFeeProduct.id} with price: ${appraisalFeePrice.id}`);

  console.log('\n--- Products Created Successfully ---');
  console.log('Application Fee Product ID:', applicationFeeProduct.id);
  console.log('Application Fee Price ID:', applicationFeePrice.id);
  console.log('Commitment Fee Product ID:', commitmentFeeProduct.id);
  console.log('Commitment Fee Price ID:', commitmentFeePrice.id);
  console.log('Appraisal Fee Product ID:', appraisalFeeProduct.id);
  console.log('Appraisal Fee Price ID:', appraisalFeePrice.id);
}

seedProducts()
  .then(() => {
    console.log('Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding products:', error);
    process.exit(1);
  });
