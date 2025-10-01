import type { RequestHandler } from "./$types";
import { createCommit, resolveRoll, revealCommit } from "$lib/server/fairness";

export const GET: RequestHandler = async () => {
  // Create a new commit for a roll session
  const { id, nonce, hash } = createCommit();
  return new Response(
    JSON.stringify({ id, nonce, hash }),
    { headers: { "content-type": "application/json" } },
  );
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const { id, clientSeed, n } = body as { id: string; clientSeed: string; n: number };
  if (!id || !clientSeed || typeof n !== "number") {
    return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
  }
  try {
    const res = resolveRoll(id, clientSeed, n);
    return new Response(JSON.stringify(res), { headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400 });
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const { id } = body as { id: string };
  if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
  try {
    const res = revealCommit(id);
    return new Response(JSON.stringify(res), { headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400 });
  }
};


