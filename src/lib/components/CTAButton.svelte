<!--
  CTAButton.svelte
  Handles the three states: idle, rolling, revealed
  Controlled by parent component
-->
<script>
  export let phase = "idle";
  export let onClick = () => {};

  // Get button text based on phase
  $: buttonText = {
    idle: "Roll your tattoo of fortune",
    rolling: "Rolling…",
    revealed: "Reveal ready",
  }[phase];

  $: isDisabled = phase === "rolling";
</script>

<button
  on:click={onClick}
  disabled={isDisabled}
  class="
    relative px-8 py-4 text-lg font-semibold rounded-lg
    bg-gradient-to-r from-purple-600 to-purple-700
    text-white shadow-lg
    transition-all duration-300 ease-out
    hover:shadow-xl hover:scale-105
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    focus:outline-none focus:ring-4 focus:ring-purple-300
  "
>
  <!-- TODO: Add Motion One animations for button states -->
  {buttonText}

  {#if phase === "rolling"}
    <!-- TODO: Add spinning animation -->
    <span class="ml-2 inline-block animate-spin">⟳</span>
  {/if}
</button>

<!-- TODO: Add button press animations -->
<!-- TODO: Implement loading state with progress indicator -->
