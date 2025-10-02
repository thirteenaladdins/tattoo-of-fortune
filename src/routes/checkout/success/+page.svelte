<script lang="ts">
  import { onMount } from "svelte";

  let loading = true;
  let error: string | null = null;
  let token: string | null = null;

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const artworkId = params.get("artwork_id");
    const isTest = params.get("test") === "true";

    if (isTest && artworkId) {
      // For test mode, directly generate a download token
      try {
        const res = await fetch("/api/purchase", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: artworkId }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          error = (payload as any).error || "Unable to process purchase";
        } else {
          const payload = (await res.json()) as { token: string };
          token = payload.token;
        }
      } catch (e) {
        error = "Network error";
      } finally {
        loading = false;
      }
    } else if (sessionId) {
      // Original flow for production Stripe sessions
      try {
        const res = await fetch(
          `/api/claim-download?session_id=${encodeURIComponent(sessionId)}`
        );
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          error = (payload as any).error || "Unable to claim download yet";
        } else {
          const payload = (await res.json()) as { token: string };
          token = payload.token;
        }
      } catch (e) {
        error = "Network error";
      } finally {
        loading = false;
      }
    } else {
      error = "Missing session ID or artwork ID";
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Purchase Successful</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-6">
  <div class="max-w-md w-full bg-white rounded-2xl shadow p-8 text-center">
    <h1 class="text-2xl font-serif font-bold mb-4">Thank you!</h1>
    {#if loading}
      <p>Preparing your download…</p>
    {:else if error}
      <p class="text-red-600">{error}</p>
      <p class="text-sm text-gray-600 mt-2">
        If this persists, your payment may still be processing. Please refresh
        in a few seconds.
      </p>
    {:else if token}
      <a
        class="inline-block mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg"
        href={`/api/download/${token}`}>Download your design</a
      >
    {/if}
  </div>
</div>
