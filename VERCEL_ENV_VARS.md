# Vercel Environment Variables

## Required Environment Variables

### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_test_... (for testing) or sk_live_... (for production)
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe webhook settings)
```

## Optional

### Static Checkout URL (if using)
```
PUBLIC_STRIPE_CHECKOUT_URL=https://buy.stripe.com/test_dRmbIT3ao9tF7HDdpBgrS00
```

## How to Set in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Click "Add New" for each variable:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
   - **Environments**: Select all (Production, Preview, Development)
5. Repeat for `STRIPE_WEBHOOK_SECRET`
6. Click "Save" after adding each variable

## Important Notes

- **Do NOT** use the `@secret_name` syntax in vercel.json
- Set the actual values directly in the Vercel dashboard
- Make sure to set them for all environments you plan to use
- The values will be encrypted and stored securely by Vercel

## Stripe Webhook Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events: `checkout.session.completed`
5. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`
