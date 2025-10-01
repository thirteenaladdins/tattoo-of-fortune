import type { RequestHandler } from '@sveltejs/kit';
import { getAndConsumeSessionToken } from '$lib/server/inventory';

export const GET: RequestHandler = async ({ url }) => {
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Missing session_id' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const entry = getAndConsumeSessionToken(sessionId);
  if (!entry) {
    return new Response(JSON.stringify({ error: 'Not ready' }), {
      status: 409,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ token: entry.token, artworkId: entry.artworkId }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};


