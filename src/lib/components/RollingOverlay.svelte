<!--
  RollingOverlay.svelte
  Simple centered loader - stationary design
  Controlled by parent - shows during rolling phase
-->

<div
  class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
>
  <div
    class="
      bg-white/90 backdrop-blur-sm rounded-full p-12 shadow-2xl
      flex flex-col items-center justify-center
      w-80 h-80
      border-4 border-purple-600/30
    "
  >
    <!-- Stationary loader -->
    <div class="relative w-16 h-16 mb-4">
      <!-- Static circle -->
      <div
        class="absolute inset-0 border-4 border-purple-600/30 rounded-full"
      ></div>
      <!-- Inner pulsing circle -->
      <div
        class="absolute inset-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full animate-pulse"
      ></div>
      <!-- Center dot -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
    </div>

    <h3 class="text-xl font-semibold text-gray-800 mb-2">
      Rolling your fortune...
    </h3>
    <p class="text-gray-600 text-center">
      The universe is choosing your design
    </p>
  </div>
</div>

<!-- TODO: Add mystical particle effects -->
<!-- TODO: Implement custom rolling dice/spinner animation -->
<!-- TODO: Add sound effects (optional) -->
