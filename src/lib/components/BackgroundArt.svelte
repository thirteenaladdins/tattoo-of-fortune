<!-- 
  BackgroundArt.svelte
  Full-bleed background image with subtle grain + vignette effects
  No business logic - pure presentation component
-->
<script>
  // TODO: Add props for different background states if needed
</script>

<div class="fixed inset-0 -z-10">
  <!-- Hero background image -->
  <div
    class="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style="background-image: url('/hero/hero-bg.svg');"
  >
    <!-- Grain texture overlay -->
    <div
      class="absolute inset-0 grain-texture opacity-20 mix-blend-overlay"
    ></div>

    <!-- Vignette effect -->
    <div class="absolute inset-0 vignette"></div>
  </div>

  <!-- Optional: Dark overlay for text readability -->
  <div class="absolute inset-0 bg-black/20"></div>
</div>

<!-- TODO: Add Motion One animations for subtle background movement -->
<!-- TODO: Implement responsive background sizing -->
<!-- TODO: Add fallback for missing hero image -->
