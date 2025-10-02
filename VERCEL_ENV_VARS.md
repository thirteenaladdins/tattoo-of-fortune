# Vercel Environment Variables

## Required for Production

### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_live_... (for production)
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe webhook settings)
```

### For Testing
```
STRIPE_SECRET_KEY=sk_test_... (for testing)
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe webhook settings)
```

## Optional

### Static Checkout URL (if using)
```
PUBLIC_STRIPE_CHECKOUT_URL=https://buy.stripe.com/test_dRmbIT3ao9tF7HDdpBgrS00
```

## How to Set in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add each variable with its value
5. Make sure to set them for all environments (Production, Preview, Development)

## Stripe Webhook Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events: `checkout.session.completed`
5. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`
