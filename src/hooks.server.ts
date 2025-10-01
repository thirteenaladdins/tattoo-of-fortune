import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname;
  // Block direct access to high-res assets that live under /static/fortunes
  if (pathname.startsWith('/fortunes/')) {
    return new Response('Not found', { status: 404 });
  }

  return resolve(event);
};


