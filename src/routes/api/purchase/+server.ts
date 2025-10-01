import type { RequestHandler } from "@sveltejs/kit";
import { purchaseArtwork } from "$lib/server/inventory";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const id = body?.id as string | undefined;
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing 'id'" }), {
        headers: { "content-type": "application/json" },
        status: 400,
      });
    }
    const result = purchaseArtwork(id);
    if (result.success) {
      return new Response(JSON.stringify({ success: true, token: result.token }), {
        headers: { "content-type": "application/json" },
        status: 200,
      });
    }
    return new Response(JSON.stringify({ error: result.error }), {
      headers: { "content-type": "application/json" },
      status: 409,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      headers: { "content-type": "application/json" },
      status: 400,
    });
  }
};

