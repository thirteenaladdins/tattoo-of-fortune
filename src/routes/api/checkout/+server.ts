import type { RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn('STRIPE_SECRET_KEY is not set. /api/checkout will not work.');
}
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    if (!stripe) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    const body = await request.json().catch(() => ({}));
    const { artworkId } = body as { artworkId?: string };
    if (!artworkId) {
      return new Response(JSON.stringify({ error: 'Missing artworkId' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const baseUrl = `${url.protocol}//${url.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `Tattoo Fortune: ${artworkId}` },
            unit_amount: 1500,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
      metadata: { artworkId },
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


