<script lang="ts">
  import { onMount } from "svelte";

  let loading = true;
  let error: string | null = null;
  let sessionData: {
    status: string;
    customer_email?: string;
    artwork_id?: string;
  } | null = null;

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      error = "Missing session ID";
      loading = false;
      return;
    }
    try {
      const res = await fetch(
        `/api/session?session_id=${encodeURIComponent(sessionId)}`
      );
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        error = (payload as any).error || "Unable to validate session";
      } else {
        const payload = (await res.json()) as {
          status: string;
          customer_email?: string;
          artwork_id?: string;
        };
        sessionData = payload;
        if (payload.status !== "paid") {
          error = "Payment not completed";
        }
      }
    } catch (e) {
      error = "Network error";
    } finally {
      loading = false;
    }
  });

  function handleDownload() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      window.location.href = `/api/download?session_id=${encodeURIComponent(sessionId)}`;
    }
  }
</script>

<svelte:head>
  <title>Purchase Successful</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-6">
  <div class="max-w-md w-full bg-white rounded-2xl shadow p-8 text-center">
    <h1 class="text-2xl font-serif font-bold mb-4">Thank you!</h1>
    {#if loading}
      <p>Validating your payment…</p>
    {:else if error}
      <p class="text-red-600">{error}</p>
      <p class="text-sm text-gray-600 mt-2">
        If this persists, your payment may still be processing. Please refresh
        in a few seconds.
      </p>
    {:else if sessionData && sessionData.status === "paid"}
      <div class="mb-6">
        <p class="text-green-600 font-semibold mb-2">Payment Successful ✅</p>
        {#if sessionData.customer_email}
          <p class="text-sm text-gray-600">
            Confirmation sent to {sessionData.customer_email}
          </p>
        {/if}
      </div>
      <button
        on:click={handleDownload}
        class="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Download your design
      </button>
    {:else}
      <p class="text-red-600">Payment validation failed</p>
    {/if}
  </div>
</div>
