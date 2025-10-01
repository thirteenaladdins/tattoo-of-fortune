import type { RequestHandler } from '@sveltejs/kit';
import { consumeDownloadToken, getArtworkById } from '$lib/server/inventory';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const MIME_MAP: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

export const GET: RequestHandler = async ({ params }) => {
  const token = params.token;
  if (!token) {
    return new Response('Missing token', { status: 400 });
  }

  const record = consumeDownloadToken(token);
  if (!record) {
    return new Response('Invalid or expired token', { status: 403 });
  }

  const artwork = getArtworkById(record.artworkId);
  if (!artwork) {
    return new Response('Artwork not found', { status: 404 });
  }

  const filePath = artwork.downloadPath ?? artwork.path;
  try {
    const absolutePath = join(process.cwd(), 'static', filePath.replace(/^\//, ''));
    const data = await readFile(absolutePath);
    const body = new Uint8Array(data);
    const ext = extname(filePath).toLowerCase();
    const mime = MIME_MAP[ext] ?? 'application/octet-stream';

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
};
