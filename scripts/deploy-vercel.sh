#!/bin/bash

# Vercel Deployment Script for Tattoo of Fortune
# This script helps prepare and deploy the app to Vercel

echo "🎨 Tattoo of Fortune - Vercel Deployment Script"
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "Install it with: npm i -g vercel"
    exit 1
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel."
    echo "Run: vercel login"
    exit 1
fi

echo "✅ Vercel CLI is ready"

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set environment variables in Vercel dashboard:"
    echo "   - STRIPE_SECRET_KEY"
    echo "   - STRIPE_WEBHOOK_SECRET"
    echo ""
    echo "2. Configure Stripe webhook:"
    echo "   - URL: https://your-app.vercel.app/api/stripe/webhook"
    echo "   - Events: checkout.session.completed"
    echo ""
    echo "3. Test your deployment!"
else
    echo "❌ Deployment failed"
    exit 1
fi
