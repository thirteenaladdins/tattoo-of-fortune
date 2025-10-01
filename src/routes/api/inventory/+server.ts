import type { RequestHandler } from "@sveltejs/kit";
import { getInventorySummary } from "$lib/server/inventory";

export const GET: RequestHandler = async () => {
  const summary = getInventorySummary();
  return new Response(JSON.stringify(summary), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
};


