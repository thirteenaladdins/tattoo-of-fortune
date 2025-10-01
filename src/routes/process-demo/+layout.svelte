<!--
  +layout.svelte for process demo page
  Override the main dark theme with a clean white layout
-->
<script lang="ts">
  import "../../styles/app.css";
</script>

<svelte:head>
  <title>Tattoo Processing Demo - Tattoo of Fortune</title>
  <meta
    name="description"
    content="Demo of AI-generated tattoo image processing into clean line art"
  />
</svelte:head>

<!-- Clean white layout for the process demo -->
<div class="min-h-screen bg-gray-50">
  <!-- Simple header -->
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <a
            href="/"
            class="text-xl font-bold text-gray-900 hover:text-blue-600"
          >
            Tattoo of Fortune
          </a>
          <span class="text-gray-400">|</span>
          <span class="text-gray-600">Process Demo</span>
        </div>
        <a
          href="/"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Main
        </a>
      </div>
    </div>
  </header>

  <!-- Main content -->
  <main class="flex-1">
    <slot />
  </main>

  <!-- Simple footer -->
  <footer class="bg-white border-t border-gray-200 py-6">
    <div class="max-w-7xl mx-auto px-4 text-center">
      <p class="text-gray-600 text-sm">
        © 2025 Tattoo of Fortune - AI Tattoo Processing Demo
      </p>
    </div>
  </footer>
</div>

<style>
  /* Ensure proper text contrast */
  :global(.process-demo-page) {
    color: #1f2937; /* text-gray-800 */
  }

  :global(.process-demo-page h1),
  :global(.process-demo-page h2),
  :global(.process-demo-page h3),
  :global(.process-demo-page h4),
  :global(.process-demo-page h5),
  :global(.process-demo-page h6) {
    color: #111827; /* text-gray-900 */
  }

  :global(.process-demo-page p) {
    color: #4b5563; /* text-gray-600 */
  }
</style>
