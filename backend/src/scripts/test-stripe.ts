import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

async function testStripeIntegration() {
  try {
    console.log('🧪 Testing Stripe Integration...\n');

    // Test 1: Check Stripe connection
    console.log('1. Testing Stripe connection...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe connection successful');
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Country: ${account.country}\n`);

    // Test 2: Create a test payment intent
    console.log('2. Creating test payment intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000, // $20.00
      currency: 'usd',
      metadata: {
        test: 'true',
        paymentId: 'test-payment-123',
        jobId: 'test-job-456',
        customerId: 'test-customer-789',
        vendorId: 'test-vendor-012',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    console.log('✅ Test payment intent created');
    console.log(`   Payment Intent ID: ${paymentIntent.id}`);
    console.log(
      `   Client Secret: ${paymentIntent.client_secret?.substring(0, 20)}...\n`
    );

    // Test 3: Check webhook configuration
    console.log('3. Checking webhook configuration...');
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.log(
        '⚠️  STRIPE_WEBHOOK_SECRET not found in environment variables'
      );
      console.log('   Please add it to your .env file\n');
    } else {
      console.log('✅ Webhook secret configured');
      console.log(
        `   Secret: ${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 20)}...\n`
      );
    }

    // Test 4: Test database connection
    console.log('4. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Test 5: Check payment table structure
    console.log('5. Checking payment table structure...');
    const paymentCount = await prisma.payment.count();
    console.log(
      `✅ Payment table accessible (${paymentCount} records found)\n`
    );

    console.log('🎉 All tests passed! Stripe integration is ready.');
    console.log('\n📝 Next steps:');
    console.log('   1. Set up webhook endpoint in Stripe Dashboard');
    console.log('   2. Test payment flow with test cards');
    console.log('   3. Monitor webhook events');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testStripeIntegration();
}

export { testStripeIntegration };
