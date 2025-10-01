<!--
  RevealModal.svelte
  Shows selected artwork with mystical copy and Buy/Close actions
-->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { copy } from "$lib/data/copy";
  import type { Artwork } from "$lib/data/artworks";

  export let artwork: Artwork;
  export let onClose: () => void = () => {};
  export let onRollAgain: (() => void) | undefined = undefined;
  export let showDownload: boolean = false;
  export let downloadToken: string | null = null;
  // Optional provably-fair details
  export let fair: {
    hash: string;
    nonce: string;
    clientSeed?: string;
    serverSeed?: string;
  } | null = null;

  let modalElement: HTMLDivElement | null = null;
  let imgFailed = false;

  // Get random mystical copy
  $: mysticalText =
    copy.MYSTICAL_COPY[Math.floor(Math.random() * copy.MYSTICAL_COPY.length)];

  const STRIPE_PLACEHOLDER = "https://checkout.stripe.com/c/pay_XXXX" as const;
  let stripeUrl: string | undefined;
  let canBuy = false;
  let isDownloading = false;
  let downloadError: string | null = null;
  let downloadSuccess = false;
  let securePreviewUrl: string | null = null;
  let previewLoading = false;
  let previewError: string | null = null;

  // Check if Stripe URL is available
  $: stripeUrl = import.meta.env.PUBLIC_STRIPE_CHECKOUT_URL;
  $: canBuy = typeof stripeUrl === "string" && stripeUrl !== STRIPE_PLACEHOLDER;

  $: if (showDownload && downloadToken && !securePreviewUrl && !previewLoading && !previewError) {
    loadSecurePreview();
  }

  async function loadSecurePreview() {
    previewLoading = true;
    previewError = null;
    try {
      const res = await fetch(`/api/download/${downloadToken}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Unable to load artwork");
      }
      const blob = await res.blob();
      if (securePreviewUrl) {
        URL.revokeObjectURL(securePreviewUrl);
      }
      securePreviewUrl = URL.createObjectURL(blob);
      imgFailed = false;
    } catch (error) {
      previewError =
        error instanceof Error ? error.message : "Unable to load artwork";
    } finally {
      previewLoading = false;
    }
  }

  async function handlePrimaryAction() {
    if (showDownload) {
      if (!downloadToken || isDownloading) {
        return;
      }
      downloadError = null;
      isDownloading = true;
      try {
        const res = await fetch(`/api/download/${downloadToken}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Download failed");
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        const extension = artwork.downloadPath?.split(".").pop() ?? "svg";
        anchor.download = `${artwork.id}.${extension}`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        downloadSuccess = true;
      } catch (error) {
        downloadError =
          error instanceof Error ? error.message : "Unable to download design";
        downloadSuccess = false;
      } finally {
        isDownloading = false;
      }
    } else if (canBuy) {
      window.open(stripeUrl, "_blank");
    }
  }

  function handleClose() {
    onClose();
  }

  function handleRollAgain() {
    if (onRollAgain) {
      onRollAgain();
    }
  }

  // Close on escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      handleClose();
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    if (securePreviewUrl) {
      URL.revokeObjectURL(securePreviewUrl);
    }
  });
</script>

<div
  bind:this={modalElement}
  class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <div
    class="
    bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto
    transform transition-all duration-500 ease-out
    animate-modal-zoom-fade
  "
  >
    <!-- Modal Header -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <h2
          id="modal-title"
          class="text-2xl font-serif font-bold text-gray-900 tracking-wide"
        >
          Your Fortune Revealed
        </h2>
        <button
          on:click={handleClose}
          class="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Modal Content -->
    <div class="p-6">
      <!-- Artwork Image -->
      <div class="mb-6 min-h-[200px] flex items-center justify-center">
        {#if previewLoading}
          <div class="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto h-48 bg-gradient-to-r from-purple-50 via-white to-purple-50 animate-pulse rounded-lg border border-purple-100 flex items-center justify-center text-sm text-purple-400">
            Preparing your artwork…
          </div>
        {:else if securePreviewUrl && !imgFailed}
          <img
            src={securePreviewUrl}
            alt={artwork.title || "Your tattoo fortune"}
            class="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto h-auto max-h-[60vh] object-contain rounded-lg shadow-lg"
            loading="lazy"
            on:error={() => {
              imgFailed = true;
              previewError = "Unable to display preview in browser";
            }}
          />
        {:else if previewError}
          <div class="text-sm text-red-600 text-center">
            {previewError}. Use the download button to retrieve the file directly.
          </div>
        {:else}
          <div class="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto h-48 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-500">
            Awaiting secure preview…
          </div>
        {/if}
      </div>

      <!-- Artwork Info -->
      <div class="mb-6">
        {#if artwork.title}
          <h3
            class="text-xl font-serif font-semibold text-gray-900 mb-2 tracking-wide"
          >
            {artwork.title}
          </h3>
        {/if}

        <p class="text-gray-700 mb-3 italic font-light tracking-wide">
          "{mysticalText}"
        </p>

        <!-- Vibe Tags -->
        <div class="flex flex-wrap gap-2 mb-4">
          {#each artwork.vibe as vibe}
            <span
              class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
            >
              {vibe}
            </span>
          {/each}
        </div>

        <p class="text-sm font-light text-gray-600 tracking-wide">
          Size: {artwork.size} • Ready for stencil
        </p>
      </div>

      {#if fair}
        <div class="mb-6 p-3 bg-gray-50 rounded border border-gray-200">
          <h4 class="text-sm font-semibold text-gray-800 mb-1">
            Provably Fair
          </h4>
          <div class="text-xs text-gray-600 space-y-2">
            <div>
              <div class="font-medium mb-1">Commit (SHA-256)</div>
              <div class="overflow-x-auto max-w-full">
                <code
                  class="block font-mono break-all text-[10px] sm:text-[11px] bg-white border border-gray-200 rounded px-2 py-1"
                >
                  {fair.hash}
                </code>
              </div>
            </div>
            {#if fair.clientSeed}
              <div>
                <span class="font-medium">Client seed:</span>
                {fair.clientSeed}
              </div>
            {/if}
            {#if fair.serverSeed}
              <div>
                <span class="font-medium">Server seed:</span>
                {fair.serverSeed}
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          on:click={handlePrimaryAction}
          disabled={(!canBuy && !showDownload) || (showDownload && (!downloadToken || isDownloading))}
          class="
            flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700
            text-white font-semibold rounded-lg
            hover:shadow-lg transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {#if showDownload}
            {#if isDownloading}
              Preparing download…
            {:else if downloadToken}
              Download Design
            {:else}
              Download locked
            {/if}
          {:else}
            {canBuy ? copy.BUY_LABEL : "Checkout link not configured"}
          {/if}
        </button>

        <button
          on:click={handleClose}
          class="
            px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg
            hover:bg-gray-50 transition-colors duration-200
          "
        >
          {copy.CLOSE_LABEL}
        </button>
      </div>

      {#if downloadError}
        <p class="mt-3 text-sm text-red-600">{downloadError}</p>
      {/if}
      {#if downloadSuccess}
        <p class="mt-3 text-sm text-green-600">Download ready — check your files.</p>
      {/if}

      <!-- Optional: Roll Again -->
      {#if onRollAgain}
        <div class="mt-4 text-center">
          <button
            on:click={handleRollAgain}
            class="text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            {copy.ROLL_AGAIN_LABEL}
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- TODO: Add modal entrance/exit animations with Motion One -->
<!-- TODO: Add image loading states and error handling -->
<!-- TODO: Implement image zoom functionality -->
