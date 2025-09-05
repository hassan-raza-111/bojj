# Stripe Payment Integration Setup Guide

## Overview

This guide will help you set up Stripe payments with webhooks for the BOJJ platform.

## Prerequisites

- Stripe account (https://stripe.com)
- Node.js backend running
- Frontend application configured

## Step 1: Stripe Account Setup

1. **Create Stripe Account**

   - Go to https://stripe.com and create an account
   - Complete account verification

2. **Get API Keys**
   - Go to Stripe Dashboard → Developers → API Keys
   - Copy your **Publishable Key** and **Secret Key**
   - For testing, use the test keys (start with `pk_test_` and `sk_test_`)

## Step 2: Environment Configuration

1. **Backend Environment Variables**
   Create or update your `.env` file in the backend directory:

   ```env
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

   # Payment Settings
   PLATFORM_FEE_PERCENTAGE=5.0
   ESCROW_FEE_PERCENTAGE=2.0
   FRONTEND_URL=http://localhost:5173
   ```

2. **Frontend Environment Variables**
   Create or update your `.env` file in the frontend directory:

   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

## Step 3: Webhook Setup

1. **Create Webhook Endpoint**

   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - Set endpoint URL: `https://your-domain.com/api/payments/stripe/webhook`
   - For local development: Use ngrok or similar tool

2. **Select Events**
   Select these events for your webhook:

   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.succeeded`
   - `charge.failed`
   - `charge.refunded`

3. **Get Webhook Secret**

   - After creating the webhook, click on it
   - Copy the **Signing secret** (starts with `whsec_`)
   - Add it to your backend `.env`:

   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

## Step 4: Local Development Setup

1. **Install ngrok** (for webhook testing)

   ```bash
   npm install -g ngrok
   ```

2. **Start your backend server**

   ```bash
   cd backend
   npm run dev
   ```

3. **Start ngrok tunnel**

   ```bash
   ngrok http 3000
   ```

4. **Update webhook URL**
   - Use the ngrok URL in your Stripe webhook endpoint
   - Example: `https://abc123.ngrok.io/api/payments/stripe/webhook`

## Step 5: Testing

1. **Test Card Numbers**
   Use these test card numbers:

   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date and any 3-digit CVC

2. **Test Payment Flow**
   - Create a job and assign it to a vendor
   - Go to payment page as customer
   - Enter test card details
   - Complete payment
   - Check webhook events in Stripe Dashboard

## Step 6: Production Deployment

1. **Switch to Live Keys**

   - Replace test keys with live keys in production
   - Update webhook endpoint to production URL
   - Ensure HTTPS is enabled

2. **Security Checklist**
   - ✅ Environment variables are secure
   - ✅ Webhook signature verification is enabled
   - ✅ HTTPS is enforced
   - ✅ Error handling is implemented
   - ✅ Logging is configured

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── payment.controller.ts      # Main payment logic
│   │   └── stripe-webhook.controller.ts # Webhook handling
│   └── routes/
│       └── payment.routes.ts          # Payment routes
├── payment-config.example             # Configuration template
└── .env                               # Environment variables

frontend/
├── src/
│   └── pages/
│       └── customer/
│           └── customerpaymentpage.tsx # Payment UI
└── .env                               # Frontend environment variables
```

## API Endpoints

### Payment Creation

- `POST /api/payments/stripe/create-intent`
  - Creates Stripe payment intent
  - Returns client secret for frontend

### Webhook

- `POST /api/payments/stripe/webhook`
  - Handles Stripe events
  - Updates payment status automatically

### Payment Management

- `GET /api/payments/:paymentId` - Get payment details
- `GET /api/payments/customer/:customerId` - Get customer payments
- `GET /api/payments/vendor/:vendorId` - Get vendor payments
- `POST /api/payments/:paymentId/release` - Release payment (Admin)
- `POST /api/payments/:paymentId/refund` - Refund payment (Admin)

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**

   - Check webhook URL is accessible
   - Verify webhook secret is correct
   - Check server logs for errors

2. **Payment intent creation fails**

   - Verify Stripe secret key is correct
   - Check amount is positive number
   - Ensure all required fields are provided

3. **Frontend payment fails**
   - Check publishable key is correct
   - Verify client secret is valid
   - Check browser console for errors

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
DEBUG=stripe:*
```

## Support

For issues:

1. Check Stripe Dashboard for payment status
2. Review server logs for errors
3. Test with Stripe's test cards
4. Contact Stripe support if needed

## Security Notes

- Never expose secret keys in frontend code
- Always verify webhook signatures
- Use HTTPS in production
- Implement proper error handling
- Log payment events for audit trail
