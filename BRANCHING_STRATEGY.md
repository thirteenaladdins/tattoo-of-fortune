# Branching Strategy

## Overview
This project uses a two-branch strategy to maintain separate versions of the app.

## Branches

### 🌿 `main` - Production Branch
- **Purpose**: Stable, production-ready code
- **Features**: Core tattoo rolling and download functionality
- **Deployment**: Production Vercel deployment
- **Stripe**: Production Stripe keys and checkout

### 🧪 `testing/vercel-stripe-integration` - Testing Branch
- **Purpose**: Testing new features and integrations
- **Features**: Vercel serverless functions + Stripe test integration
- **Deployment**: Testing Vercel deployment
- **Stripe**: Test Stripe keys and checkout links

## Workflow

### Development Process
1. **New features** → Start on `testing/vercel-stripe-integration`
2. **Test thoroughly** → Deploy to testing Vercel instance
3. **When stable** → Merge to `main` for production
4. **Keep branches separate** → Each serves different purposes

### Branch Management
```bash
# Switch to testing branch
git checkout testing/vercel-stripe-integration

# Switch to main branch
git checkout main

# Create new feature branch from testing
git checkout testing/vercel-stripe-integration
git checkout -b feature/new-feature

# Merge testing to main (when ready)
git checkout main
git merge testing/vercel-stripe-integration
```

## Deployment Strategy

### Testing Branch
- **URL**: `https://tattoo-of-fortune-test.vercel.app` (example)
- **Environment**: Test Stripe keys
- **Purpose**: Feature testing, integration testing

### Main Branch
- **URL**: `https://tattoo-of-fortune.vercel.app` (example)
- **Environment**: Production Stripe keys
- **Purpose**: Live production app

## Environment Variables

### Testing Branch
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (test webhook)
```

### Main Branch
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (production webhook)
```

## Benefits

1. **Safe Testing**: Test new features without affecting production
2. **Parallel Development**: Work on features while maintaining stable production
3. **Easy Rollback**: Can quickly switch between versions
4. **Staged Deployment**: Test → Staging → Production workflow
