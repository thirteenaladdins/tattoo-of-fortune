<!--
  ScarcityBadge.svelte
  Shows availability count (MVP: hardcoded)
  TODO: Connect to server endpoint for real-time updates
-->
<script>
  import { onMount } from "svelte";
  export let available = 0;
  export let total = 0;

  async function refresh() {
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const data = await res.json();
        available = data.available;
        total = data.total;
      }
    } catch (e) {
      // ignore errors
    }
  }

  onMount(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  });

  $: scarcityText = `${available} / ${total} available`;
  $: isLow = available <= 3;
  $: isCritical = available <= 1;
</script>

<div
  class="
  inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
  {isCritical
    ? 'bg-red-100 text-red-800 border border-red-200'
    : isLow
      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      : 'bg-green-100 text-green-800 border border-green-200'}
  shadow-sm
"
>
  <!-- TODO: Add pulsing animation when critically low -->
  {#if isCritical}
    <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
  {:else if isLow}
    <span class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
  {:else}
    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
  {/if}

  {scarcityText}
</div>

<!-- TODO: Connect to real-time server endpoint -->
<!-- TODO: Add countdown timer for restocking -->
<!-- TODO: Implement user-specific scarcity (if logged in) -->
