import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * This endpoint is disabled in Vercel serverless environment
 * due to native dependencies (sharp, potrace) not being compatible
 * with the serverless runtime.
 */
export const POST: RequestHandler = async () => {
  return json({
    error: 'Image processing is not available in serverless environment',
    message: 'This endpoint requires native dependencies that are not supported in Vercel serverless functions.',
    alternatives: [
      'Use client-side image processing libraries',
      'Implement with external image processing service',
      'Use Vercel Edge Runtime for lighter processing'
    ]
  }, { status: 501 });
};

export const GET: RequestHandler = async () => {
  return json({
    error: 'Image processing is not available in serverless environment',
    message: 'This endpoint requires native dependencies that are not supported in Vercel serverless functions.',
    alternatives: [
      'Use client-side image processing libraries',
      'Implement with external image processing service',
      'Use Vercel Edge Runtime for lighter processing'
    ]
  }, { status: 501 });
};
