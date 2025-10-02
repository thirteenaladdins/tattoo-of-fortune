import type { RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';
import { finalizePurchase, setSessionToken } from '$lib/server/inventory';

export const prerender = false;

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;

export const POST: RequestHandler = async ({ request }) => {
  if (!stripe || !webhookSecret) {
    return new Response('Stripe not configured', { status: 500 });
  }

  const sig = request.headers.get('stripe-signature');
  if (!sig) return new Response('Missing signature', { status: 400 });

  const body = await request.arrayBuffer();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(body), sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const artworkId = (session.metadata?.artwork_id as string) || null;
    if (artworkId && session.payment_status === 'paid') {
      const result = finalizePurchase(artworkId);
      if (result.success) {
        setSessionToken(session.id, result.token, artworkId);
      } else {
        console.error('Finalize purchase failed:', result.error);
      }
    }
  }

  return new Response('ok');
};


