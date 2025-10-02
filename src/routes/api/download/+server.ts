import type { RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';
import { getArtworkById } from '$lib/server/inventory';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn('STRIPE_SECRET_KEY is not set. /api/download will not work.');
}
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' }) : null;

const MIME_MAP: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

export const GET: RequestHandler = async ({ url }) => {
  try {
    const sessionId = url.searchParams.get('session_id');
    if (!sessionId) {
      return new Response('Missing session_id', { status: 400 });
    }

    if (!stripe) {
      return new Response('Stripe not configured', { status: 500 });
    }

    // Validate the session and ensure it's paid
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return new Response('Payment not completed', { status: 403 });
    }

    const artworkId = session.metadata?.artwork_id;
    if (!artworkId) {
      return new Response('No artwork ID in session', { status: 400 });
    }

    const artwork = getArtworkById(artworkId);
    if (!artwork) {
      return new Response('Artwork not found', { status: 404 });
    }

    const filePath = artwork.downloadPath ?? artwork.path;
    try {
      const blobBaseUrl = process.env.BLOB_BASE_URL;
      const ext = extname(filePath).toLowerCase();

      // Prefer Vercel Blob if configured
      if (blobBaseUrl) {
        const base = blobBaseUrl.replace(/\/+$/, '');
        const key = filePath.replace(/^\//, '');
        const assetUrl = `${base}/${key}`;
        const res = await fetch(assetUrl);
        if (!res.ok) {
          if (res.status === 404) {
            return new Response('File not found', { status: 404 });
          }
          return new Response('Failed to fetch from blob', { status: 502 });
        }

        const body = new Uint8Array(await res.arrayBuffer());
        const mime = res.headers.get('content-type') ?? MIME_MAP[ext] ?? 'application/octet-stream';
        return new Response(body, {
          status: 200,
          headers: {
            'content-type': mime,
            'content-disposition': `attachment; filename="${artwork.id}${ext}"`,
          },
        });
      }

      // Fallback: fetch from same-origin static (works on Vercel)
      const sameOriginUrl = new URL(filePath, url.origin).toString();
      const res = await fetch(sameOriginUrl);
      if (!res.ok) {
        if (res.status === 404) {
          return new Response('File not found', { status: 404 });
        }
        return new Response('Failed to fetch static file', { status: 502 });
      }
      const body = new Uint8Array(await res.arrayBuffer());
      const mime = res.headers.get('content-type') ?? MIME_MAP[ext] ?? 'application/octet-stream';
      return new Response(body, {
        status: 200,
        headers: {
          'content-type': mime,
          'content-disposition': `attachment; filename="${artwork.id}${ext}"`,
        },
      });
    } catch (err) {
      console.error('Failed to serve download', err);
      return new Response('Failed to prepare download', { status: 500 });
    }
  } catch (err) {
    console.error('Download error', err);
    return new Response('Failed to process download', { status: 500 });
  }
};
