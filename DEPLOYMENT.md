# Vercel Deployment Guide

## Overview
This guide covers deploying the Tattoo of Fortune app to Vercel with serverless functions.

## Prerequisites
1. Vercel account
2. Stripe account with test keys
3. Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables

Set these in your Vercel project settings:

### Required
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_test_` for test mode)
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret (starts with `whsec_`)

### Optional
- `PUBLIC_STRIPE_CHECKOUT_URL` - For static Stripe checkout links

## Deployment Steps

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect SvelteKit

### 2. Configure Build Settings
- **Framework Preset**: SvelteKit
- **Build Command**: `npm run build`
- **Output Directory**: `.svelte-kit`
- **Install Command**: `npm install`

### 3. Set Environment Variables
In Vercel project settings → Environment Variables:

```
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Deploy
Click "Deploy" and wait for the build to complete.

## API Endpoints

The following serverless functions will be available:

- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/purchase` - Process artwork purchase
- `GET /api/claim-download` - Claim download token
- `GET /api/download/[token]` - Download artwork file
- `GET /api/inventory` - Get inventory status
- `GET /api/fairness` - Get fairness proof
- `POST /api/stripe/webhook` - Stripe webhook handler

## Limitations

### Image Processing
The `/api/process-tattoo` endpoint uses native dependencies (`sharp`, `potrace`) that may not work in Vercel's serverless environment. Consider:

1. **Client-side processing** - Move image processing to the browser
2. **External service** - Use a dedicated image processing service
3. **Edge functions** - Use Vercel Edge Runtime for lighter processing

### File Storage
Static files in `/static/fortunes/` will be served from Vercel's CDN.

## Testing

After deployment:

1. Visit your Vercel URL
2. Test the roll functionality
3. Test the checkout flow with your test Stripe link
4. Verify download functionality

## Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook secret to environment variables

## Troubleshooting

### Build Errors
- Check Node.js version (should be 18.x)
- Verify all dependencies are in `package.json`
- Check for native module compatibility

### Runtime Errors
- Check environment variables are set
- Verify Stripe keys are correct
- Check Vercel function logs

### Image Processing Issues
- Consider moving to client-side processing
- Use external image processing service
- Implement fallback for serverless limitations
