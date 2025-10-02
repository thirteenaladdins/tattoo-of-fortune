<script lang="ts">
  function handleReturnHome() {
    window.location.href = "/";
  }
</script>

<svelte:head>
  <title>Order Canceled</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-6">
  <div class="max-w-md w-full bg-white rounded-2xl shadow p-8 text-center">
    <h1 class="text-2xl font-serif font-bold mb-4 text-gray-900">
      Order Canceled
    </h1>
    <p class="text-gray-600 mb-6">
      Your payment was canceled. No charges have been made.
    </p>
    <button
      on:click={handleReturnHome}
      class="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    >
      Return to Roll
    </button>
  </div>
</div>
