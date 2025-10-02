<!--
  +page.svelte
  Main landing page with roll flow: idle → rolling → revealed
-->
<script lang="ts">
  import { onMount } from "svelte";
  import CTAButton from "$lib/components/CTAButton.svelte";
  import RollingOverlay from "$lib/components/RollingOverlay.svelte";
  import RevealModal from "$lib/components/RevealModal.svelte";
  import { copy } from "$lib/data/copy";
  import {
    rollArtwork,
    fetchAvailableArtworks,
    startFairCommit,
    resolveFairIndex,
    revealFairSeed,
  } from "$lib/utils/roll";
  import type { Artwork } from "$lib/data/artworks";
  import {
    detectUserCurrency,
    getCurrencyInfo,
    type Currency,
  } from "$lib/utils/currency";
  import CurrencySelector from "$lib/components/CurrencySelector.svelte";

  // State management
  let phase: "idle" | "rolling" | "payment" | "revealed" = "idle";
  let selectedArtwork: Artwork | null = null;
  let fair: {
    id: string;
    hash: string;
    nonce: string;
    clientSeed?: string;
    serverSeed?: string;
  } | null = null;
  let rollingTimeout: ReturnType<typeof setTimeout> | null = null;
  let isProcessingPayment = false;
  let selectedCurrency: Currency = "gbp";
  let downloadToken: string | null = null;

  async function handleRoll(): Promise<void> {
    if (phase !== "idle") {
      return;
    }

    // Start rolling phase
    phase = "rolling";

    if (rollingTimeout) {
      clearTimeout(rollingTimeout);
      rollingTimeout = null;
    }

    // Simulate rolling delay (4 seconds)
    rollingTimeout = setTimeout(async () => {
      try {
        downloadToken = null;
        const available = await fetchAvailableArtworks();
        // Start provably-fair commit
        const commit = await startFairCommit();
        fair = { id: commit.id, hash: commit.hash, nonce: commit.nonce };
        // Resolve index using clientSeed and server commit
        const resolved = await resolveFairIndex(commit.id, available.length);
        fair = {
          ...fair,
          clientSeed: resolved.clientSeed,
          hash: resolved.hash,
          nonce: resolved.nonce,
        };
        selectedArtwork = available[resolved.index];
        phase = "payment"; // Go to payment instead of revealed
      } catch (e) {
        // Fallback: reset state if inventory fetch fails
        phase = "idle";
        selectedArtwork = null;
        console.error(e);
      }
    }, 4000); // 4 seconds
  }

  function handleCloseModal() {
    phase = "idle";
    selectedArtwork = null;
  }

  function handleRollAgain() {
    handleCloseModal();
    handleRoll();
  }

  async function handlePayment(): Promise<void> {
    if (!selectedArtwork) return;
    isProcessingPayment = true;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ artwork_id: selectedArtwork.id }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const { error } = payload as { error?: string };
        alert(`Checkout failed: ${error}`);
        isProcessingPayment = false;
        return;
      }
      const url = (payload as { url?: string }).url;
      if (url) {
        window.location.href = url;
        return;
      }
      isProcessingPayment = false;
    } catch (err) {
      alert("Network error while starting checkout");
      isProcessingPayment = false;
    }
  }

  function handleCurrencyChange(currency: Currency) {
    selectedCurrency = currency;
  }

  // Cleanup timeout on component destroy
  onMount(() => {
    // Detect user's currency on page load
    detectUserCurrency().then((currency) => {
      selectedCurrency = currency;
    });

    return () => {
      if (rollingTimeout) {
        clearTimeout(rollingTimeout);
        rollingTimeout = null;
      }
    };
  });
</script>

<svelte:head>
  <title>{copy.TITLE}</title>
  <meta name="description" content={copy.SUBHEAD} />
</svelte:head>

<!-- Hero Section -->
<section class="min-h-screen flex items-center justify-center px-6">
  <div class="max-w-4xl mx-auto text-center">
    <!-- Main Title -->
    <h1
      class="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight tracking-wide animate-fade-in-up hover-lift"
    >
      {copy.TITLE}
    </h1>

    <!-- Subhead -->
    <p
      class="text-xl md:text-2xl font-light text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed tracking-wide animate-fade-in-up animation-delay-200 hover-lift"
    >
      {copy.SUBHEAD}
    </p>

    <!-- CTA Button -->
    <div class="mb-8 animate-fade-in-up animation-delay-400">
      <CTAButton {phase} onClick={handleRoll} />
    </div>

    <!-- Disclaimer -->
    <p
      class="text-sm font-light text-gray-300 max-w-lg mx-auto tracking-wide animate-fade-in-up animation-delay-600 hover-lift"
    >
      {copy.DISCLAIMER}
    </p>
  </div>
</section>

<!-- Rolling Overlay -->
{#if phase === "rolling"}
  <RollingOverlay />
{/if}

<!-- Payment Modal -->
{#if phase === "payment" && selectedArtwork}
  <div
    class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
      <div class="text-center">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-serif font-bold text-gray-900 tracking-wide">
            Complete Your Purchase
          </h2>
          <CurrencySelector
            bind:selectedCurrency
            onCurrencyChange={handleCurrencyChange}
          />
        </div>

        <!-- Selected Design Preview (Blurred) -->
        <div
          class="mb-6 p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300"
        >
          <div
            class="w-full h-32 rounded bg-gradient-to-r from-purple-100 via-gray-100 to-blue-100 flex items-center justify-center text-gray-500 text-sm font-medium tracking-wide uppercase"
          >
            Mystery design locked
          </div>
          <p class="mt-3 text-sm text-gray-600 font-medium">
            {selectedArtwork.title}
          </p>
          <p class="text-xs text-gray-500 mt-1">{copy.PAYMENT_BLUR_TEXT}</p>
        </div>

        <!-- Removed redundant on-site payment form (Stripe Checkout is used) -->

        <!-- Payment Button -->
        <button
          on:click={handlePayment}
          disabled={isProcessingPayment}
          class="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          {#if isProcessingPayment}
            Processing Payment...
          {:else}
            Pay {getCurrencyInfo(selectedCurrency).display}
          {/if}
        </button>

        <button
          on:click={handleCloseModal}
          class="mt-3 w-full px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isProcessingPayment}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Reveal Modal (Post-Payment) -->
{#if phase === "revealed" && selectedArtwork}
  <RevealModal
    artwork={selectedArtwork}
    onClose={handleCloseModal}
    onRollAgain={handleRollAgain}
    showDownload={Boolean(downloadToken)}
    {downloadToken}
    fair={fair && {
      hash: fair.hash,
      nonce: fair.nonce,
      clientSeed: fair.clientSeed,
      serverSeed: fair.serverSeed,
    }}
  />
{/if}

<!-- TODO: Add hero section animations on load -->
<!-- TODO: Implement scroll-triggered animations -->
<!-- TODO: Add particle effects or mystical elements -->
<!-- TODO: Optimize for mobile touch interactions -->
