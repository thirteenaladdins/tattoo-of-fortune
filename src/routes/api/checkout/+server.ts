import type { RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn('STRIPE_SECRET_KEY is not set. /api/checkout will not work.');
}
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' }) : null;

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { artworkId } = body as { artworkId?: string };
    if (!artworkId) {
      return new Response(JSON.stringify({ error: 'Missing artworkId' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // For testing: Use the test Stripe link with proper redirect URLs
    const baseUrl = `${url.protocol}//${url.host}`;
    const testStripeUrl = "https://buy.stripe.com/test_dRmbIT3ao9tF7HDdpBgrS00";
    
    // Store the artwork ID in session storage for the success page to retrieve
    // This is a simple approach for testing - in production you'd want to use Stripe metadata
    const successUrl = `${baseUrl}/checkout/success?artwork_id=${encodeURIComponent(artworkId)}&test=true`;
    
    // Redirect to test Stripe with success URL as a parameter
    const stripeUrlWithRedirect = `${testStripeUrl}?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(baseUrl)}`;
    
    return new Response(JSON.stringify({ 
      id: 'test-session', 
      url: stripeUrlWithRedirect 
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('Checkout error', err);
    return new Response(JSON.stringify({ error: 'Failed to create session' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};


