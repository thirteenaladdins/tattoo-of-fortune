<!--
  Logo.svelte
  Minimal gradient square + wordmark
  TODO: Replace with actual logo design
-->
<script>
  export let size = "md";
  export let showText = true;

  $: sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-12 h-12 text-xl",
    lg: "w-16 h-16 text-2xl",
  }[size];
</script>

<div class="flex items-center gap-3">
  <!-- Logo Text -->
  {#if showText}
    <div
      class="font-bold text-gray-300 tracking-tight hover:text-purple-400 transition-colors"
    >
      Tattoo of Fortune
    </div>
  {/if}
</div>

<!-- TODO: Add hover animations -->
<!-- TODO: Implement different logo variants -->
<!-- TODO: Add logo animation on page load -->
