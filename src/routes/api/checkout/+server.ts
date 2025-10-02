import type { RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.PRICE_ID;
const appBaseUrl = process.env.APP_BASE_URL;

if (!stripeSecret) {
  console.warn('STRIPE_SECRET_KEY is not set. /api/checkout will not work.');
}
if (!priceId) {
  console.warn('PRICE_ID is not set. /api/checkout will not work.');
}
if (!appBaseUrl) {
  console.warn('APP_BASE_URL is not set. /api/checkout will not work.');
}

const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' }) : null;

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { artwork_id } = body as { artwork_id?: string };
    if (!artwork_id) {
      return new Response(JSON.stringify({ error: 'Missing artwork_id' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (!stripe || !priceId || !appBaseUrl) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appBaseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBaseUrl}/cancel`,
      metadata: { artwork_id },
    });

    return new Response(JSON.stringify({ id: session.id, url: session.url }), {
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


