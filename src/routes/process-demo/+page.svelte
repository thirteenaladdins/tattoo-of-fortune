<script lang="ts">
  import TattooProcessor from "$lib/components/TattooProcessor.svelte";
  import type { ProcessTattooResponse } from "$lib/utils/tattooProcessor.js";

  let processedResults: ProcessTattooResponse[] = [];

  function handleProcessed(result: ProcessTattooResponse) {
    processedResults = [...processedResults, result];
  }

  function clearResults() {
    processedResults = [];
  }
</script>

<div class="process-demo-page">
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        AI Tattoo Processing Demo
      </h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Upload AI-generated tattoo images and convert them into clean,
        tattoo-ready line art with consistent sizing. Perfect for preparing
        uniform designs for actual tattooing.
      </p>
    </div>

    <!-- Main Processor -->
    <div class="mb-12">
      <TattooProcessor onProcessed={handleProcessed} />
    </div>

    <!-- Processing History -->
    {#if processedResults.length > 0}
      <div class="bg-white rounded-lg p-6 shadow-sm mb-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-900">
            Processing History
          </h2>
          <button
            on:click={clearResults}
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Clear All
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each processedResults as result, index}
            <div
              class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div class="flex justify-between items-start mb-3">
                <h3 class="font-medium text-gray-900">#{index + 1}</h3>
                <span
                  class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  {result.format.toUpperCase()}
                </span>
              </div>

              <div class="mb-3">
                <img
                  src={result.processedImage}
                  alt="Processed tattoo"
                  class="w-full h-32 object-contain bg-gray-50 rounded border"
                />
              </div>

              <div class="text-sm text-gray-600 space-y-1">
                <div class="flex justify-between">
                  <span>Size:</span>
                  <span
                    >{result.processedDimensions.width} × {result
                      .processedDimensions.height}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span>Time:</span>
                  <span>{result.metadata.processingTime}ms</span>
                </div>
                <div class="flex justify-between">
                  <span>Optimizations:</span>
                  <span class="text-xs"
                    >{result.metadata.optimizationsApplied.length}</span
                  >
                </div>
              </div>

              <div class="mt-3 pt-3 border-t border-gray-100">
                <button
                  on:click={() => {
                    const link = document.createElement("a");
                    link.href = result.processedImage;
                    link.download = `processed-tattoo-${index + 1}.${result.format}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  class="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Features Section -->
    <div class="bg-white rounded-lg p-8 shadow-sm mb-8">
      <h2 class="text-2xl font-semibold text-gray-900 text-center mb-8">
        Processing Features
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="text-center">
          <div
            class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Edge Detection</h3>
          <p class="text-gray-600">
            Advanced edge detection algorithms to extract clean lines from
            AI-generated images
          </p>
        </div>

        <div class="text-center">
          <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            SVG Optimization
          </h3>
          <p class="text-gray-600">
            Convert raster images to scalable vector graphics with optimized
            paths
          </p>
        </div>

        <div class="text-center">
          <div
            class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Noise Reduction
          </h3>
          <p class="text-gray-600">
            Clean up artifacts and noise from AI-generated images for crisp line
            art
          </p>
        </div>

        <div class="text-center">
          <div
            class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Format Flexibility
          </h3>
          <p class="text-gray-600">
            Output in both SVG and PNG formats depending on your tattooing needs
          </p>
        </div>

        <div class="text-center">
          <div
            class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Customizable</h3>
          <p class="text-gray-600">
            Adjust stroke width, colors, and processing parameters for your
            needs
          </p>
        </div>

        <div class="text-center">
          <div
            class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Fast Processing
          </h3>
          <p class="text-gray-600">
            Optimized algorithms for quick processing of tattoo images
          </p>
        </div>

        <div class="text-center">
          <div
            class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Uniform Sizing</h3>
          <p class="text-gray-600">
            Consistent dimensions with size presets and custom scaling options
          </p>
        </div>
      </div>
    </div>

    <!-- Usage Instructions -->
    <div class="usage-instructions mt-16 bg-gray-50 rounded-lg p-8">
      <h2 class="text-2xl font-semibold text-gray-900 text-center mb-6">
        How to Use
      </h2>

      <div class="max-w-3xl mx-auto">
        <div class="space-y-6">
          <div class="flex items-start space-x-4">
            <div
              class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium"
            >
              1
            </div>
            <div>
              <h3 class="font-medium text-gray-900">
                Upload Your AI-Generated Tattoo
              </h3>
              <p class="text-gray-600 mt-1">
                Upload an image file (PNG, JPEG, or SVG) or paste an image URL
                from any AI tattoo generator.
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div
              class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium"
            >
              2
            </div>
            <div>
              <h3 class="font-medium text-gray-900">
                Choose Processing Options
              </h3>
              <p class="text-gray-600 mt-1">
                Select output format (SVG for vector graphics, PNG for raster),
                adjust stroke width, colors, and other parameters.
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div
              class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium"
            >
              3
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Process and Download</h3>
              <p class="text-gray-600 mt-1">
                Click process to clean up the image and convert it to
                tattoo-ready line art. Download the result for your tattoo
                artist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .process-demo-page {
    @apply min-h-screen;
  }
</style>
