# Testing Branch: `testing/vercel-stripe-integration`

## Overview
This branch contains all the changes for testing Vercel serverless functions and Stripe integration.

## What's Included

### 🚀 Vercel Configuration
- `vercel.json` - Serverless function configuration
- `svelte.config.js` - Vercel adapter setup
- `DEPLOYMENT.md` - Complete deployment guide
- `VERCEL_ENV_VARS.md` - Environment variables reference

### 💳 Stripe Integration
- Test Stripe checkout link integration
- Success page with download token generation
- Both main page and RevealModal buy buttons updated
- Checkout API with proper redirect handling

### 🛠 Deployment Tools
- `scripts/deploy-vercel.sh` - Automated deployment script
- Package.json scripts for deployment
- Environment variable configuration

### 📁 New Files
- `src/routes/api/process-tattoo-disabled/+server.ts` - Disabled endpoint for serverless
- `TESTING_BRANCH.md` - This file

## Testing Checklist

### Local Testing
- [ ] App runs on `http://localhost:5174`
- [ ] Roll functionality works
- [ ] Buy button redirects to test Stripe link
- [ ] Success page generates download token
- [ ] Download functionality works

### Vercel Deployment Testing
- [ ] Deploy to Vercel using `npm run deploy`
- [ ] Set environment variables in Vercel dashboard
- [ ] Test checkout flow on live URL
- [ ] Verify webhook configuration
- [ ] Test download functionality

## Branch Status
- **Current Branch**: `testing/vercel-stripe-integration`
- **Remote**: Pushed to `origin/testing/vercel-stripe-integration`
- **Base**: `main` branch
- **Status**: Ready for testing

## Next Steps
1. Test locally to ensure everything works
2. Deploy to Vercel for live testing
3. Configure Stripe webhook
4. Test complete purchase flow
5. Merge to main when ready

## Rollback
To switch back to main branch:
```bash
git checkout main
```

To delete this testing branch (after merging):
```bash
git branch -d testing/vercel-stripe-integration
git push origin --delete testing/vercel-stripe-integration
```
