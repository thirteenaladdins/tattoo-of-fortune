import type { RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn('STRIPE_SECRET_KEY is not set. /api/session will not work.');
}
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' }) : null;

export const GET: RequestHandler = async ({ url }) => {
  try {
    const sessionId = url.searchParams.get('session_id');
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Missing session_id' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (!stripe) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return new Response(JSON.stringify({
      status: session.payment_status,
      customer_email: session.customer_email,
      artwork_id: session.metadata?.artwork_id,
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('Session validation error', err);
    return new Response(JSON.stringify({ error: 'Failed to validate session' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
