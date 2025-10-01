<script lang="ts">
  import { onMount } from "svelte";
  import {
    tattooProcessor,
    type ProcessTattooResponse,
  } from "$lib/utils/tattooProcessor.js";
  import type { ProcessingOptions } from "$lib/utils/imageProcessor.js";

  // Props
  export let onProcessed: (result: ProcessTattooResponse) => void = () => {};
  export let defaultOptions: Partial<ProcessingOptions> = {
    outputFormat: "png", // Default to PNG for high quality
    strokeWidth: 2,
    strokeColor: "#000000",
    backgroundColor: "transparent",
    sizePreset: "medium",
    maintainAspectRatio: true,
  };

  // State
  let fileInput: HTMLInputElement;
  let urlInput = "";
  let isProcessing = false;
  let processingProgress = 0;
  let error: string | null = null;
  let previewImage: string | null = null;
  let processedResult: ProcessTattooResponse | null = null;

  // Processing options state
  let outputFormat: "svg" | "png" = defaultOptions.outputFormat || "png";
  let strokeWidth = defaultOptions.strokeWidth || 2;
  let strokeColor = defaultOptions.strokeColor || "#000000";
  let backgroundColor = defaultOptions.backgroundColor || "transparent";
  let threshold = 128;
  let optimizeSvg = true;
  let sizePreset: "small" | "medium" | "large" | "custom" =
    defaultOptions.sizePreset || "medium";
  let maintainAspectRatio = defaultOptions.maintainAspectRatio !== false;
  let customWidth = 512;
  let customHeight = 512;

  // Processing options
  const processingOptions: ProcessingOptions = {
    outputFormat,
    strokeWidth,
    strokeColor,
    backgroundColor,
    threshold,
    optimizeSvg,
    sizePreset,
    maintainAspectRatio,
    targetSize:
      sizePreset === "custom"
        ? { width: customWidth, height: customHeight }
        : undefined,
  };

  // Update processing options when values change
  $: processingOptions.outputFormat = outputFormat;
  $: processingOptions.strokeWidth = strokeWidth;
  $: processingOptions.strokeColor = strokeColor;
  $: processingOptions.backgroundColor = backgroundColor;
  $: processingOptions.threshold = threshold;
  $: processingOptions.optimizeSvg = optimizeSvg;
  $: processingOptions.sizePreset = sizePreset;
  $: processingOptions.maintainAspectRatio = maintainAspectRatio;
  $: processingOptions.targetSize =
    sizePreset === "custom"
      ? { width: customWidth, height: customHeight }
      : undefined;

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files ? Array.from(target.files) : [];
    if (files.length === 0) return;

    if (files.length === 1) {
      handleFileUpload(files[0]);
      return;
    }

    handleFilesUpload(files);
  }

  async function handleFilesUpload(files: File[]) {
    // basic validation
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) {
      error = "Please select valid image files";
      return;
    }

    // Preview first file only (keep UI simple)
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage = e.target?.result as string;
    };
    reader.readAsDataURL(valid[0]);

    // Process sequentially to avoid overloading the server
    isProcessing = true;
    error = null;
    processingProgress = 0;

    const total = valid.length;
    let processedCount = 0;

    try {
      for (const file of valid) {
        try {
          const result = await tattooProcessor.processFromFile(
            file,
            processingOptions
          );
          processedResult = result; // show last processed details
          onProcessed(result);
        } catch (e) {
          // continue with next file
          console.error("Failed to process", file.name, e);
        }
        processedCount += 1;
        processingProgress = Math.round((processedCount / total) * 100);
      }
    } finally {
      isProcessing = false;
      setTimeout(() => (processingProgress = 0), 800);
    }
  }

  function handleUrlSubmit() {
    if (urlInput.trim()) {
      handleUrlUpload(urlInput.trim());
    }
  }

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      error = "Please select a valid image file";
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    await processImage(() =>
      tattooProcessor.processFromFile(file, processingOptions)
    );
  }

  async function handleUrlUpload(url: string) {
    await processImage(() =>
      tattooProcessor.processFromUrl(url, processingOptions)
    );
  }

  async function processImage(processor: () => Promise<ProcessTattooResponse>) {
    isProcessing = true;
    error = null;
    processingProgress = 0;

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        processingProgress = Math.min(processingProgress + 10, 90);
      }, 200);

      const result = await processor();

      clearInterval(progressInterval);
      processingProgress = 100;

      processedResult = result;
      onProcessed(result);

      // Reset progress after a delay
      setTimeout(() => {
        processingProgress = 0;
      }, 1000);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to process image";
    } finally {
      isProcessing = false;
    }
  }

  function downloadResult() {
    if (!processedResult) return;

    const link = document.createElement("a");
    link.href = processedResult.processedImage;
    link.download = `processed-tattoo.${processedResult.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function reset() {
    previewImage = null;
    processedResult = null;
    error = null;
    processingProgress = 0;
    if (fileInput) fileInput.value = "";
    urlInput = "";
  }
</script>

<div class="tattoo-processor">
  <div class="processor-header">
    <h3 class="text-lg font-semibold mb-4">Process AI-Generated Tattoo</h3>
    <p class="text-sm text-gray-600 mb-6">
      Upload an AI-generated tattoo image to convert it into clean line art
      suitable for tattooing.
    </p>
  </div>

  <!-- Upload Methods -->
  <div class="upload-methods mb-6">
    <!-- File Upload -->
    <div class="upload-section mb-4">
      <label
        for="file-upload"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        Upload Image File
      </label>
      <input
        id="file-upload"
        bind:this={fileInput}
        type="file"
        accept="image/*"
        multiple
        on:change={handleFileSelect}
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        disabled={isProcessing}
      />
    </div>

    <!-- URL Upload -->
    <div class="upload-section">
      <label
        for="url-input"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        Or paste image URL
      </label>
      <div class="flex gap-2">
        <input
          id="url-input"
          type="url"
          bind:value={urlInput}
          placeholder="https://example.com/image.png"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isProcessing}
          on:keydown={(e) => e.key === "Enter" && handleUrlSubmit()}
        />
        <button
          on:click={handleUrlSubmit}
          disabled={isProcessing || !urlInput.trim()}
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Process
        </button>
      </div>
    </div>
  </div>

  <!-- Processing Options -->
  <div class="processing-options mb-6">
    <h4 class="text-md font-medium mb-3">Processing Options</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Output Format -->
      <div>
        <label
          for="output-format"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Output Format</label
        >
        <select
          id="output-format"
          bind:value={outputFormat}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isProcessing}
        >
          <option value="svg">SVG (Vector)</option>
          <option value="png">PNG (Raster)</option>
        </select>
      </div>

      <!-- Stroke Width (for SVG) -->
      {#if outputFormat === "svg"}
        <div>
          <label
            for="stroke-width"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Stroke Width</label
          >
          <input
            id="stroke-width"
            type="range"
            min="1"
            max="10"
            bind:value={strokeWidth}
            class="w-full"
            disabled={isProcessing}
          />
          <div class="text-sm text-gray-600 mt-1">{strokeWidth}px</div>
        </div>
      {/if}

      <!-- Stroke Color (for SVG) -->
      {#if outputFormat === "svg"}
        <div>
          <label
            for="stroke-color"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Stroke Color</label
          >
          <input
            id="stroke-color"
            type="color"
            bind:value={strokeColor}
            class="w-full h-10 border border-gray-300 rounded-md"
            disabled={isProcessing}
          />
        </div>
      {/if}

      <!-- Background Color (for PNG) -->
      {#if outputFormat === "png"}
        <div>
          <label
            for="background-color"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Background</label
          >
          <select
            id="background-color"
            bind:value={backgroundColor}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          >
            <option value="transparent">Transparent</option>
            <option value="#ffffff">White</option>
            <option value="#000000">Black</option>
          </select>
        </div>
      {/if}

      <!-- Threshold -->
      <div>
        <label
          for="threshold"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Edge Threshold</label
        >
        <input
          id="threshold"
          type="range"
          min="50"
          max="200"
          bind:value={threshold}
          class="w-full"
          disabled={isProcessing}
        />
        <div class="text-sm text-gray-600 mt-1">{threshold}</div>
      </div>

      <!-- Size Preset -->
      <div>
        <label
          for="size-preset"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Size Preset</label
        >
        <select
          id="size-preset"
          bind:value={sizePreset}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isProcessing}
        >
          <option value="small">Small (256×256)</option>
          <option value="medium">Medium (512×512)</option>
          <option value="large">Large (1024×1024)</option>
          <option value="custom">Custom Size</option>
        </select>
      </div>

      <!-- Custom Size (only show when custom is selected) -->
      {#if sizePreset === "custom"}
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label
              for="custom-width"
              class="block text-sm font-medium text-gray-700 mb-1">Width</label
            >
            <input
              id="custom-width"
              type="number"
              bind:value={customWidth}
              min="64"
              max="2048"
              step="64"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label
              for="custom-height"
              class="block text-sm font-medium text-gray-700 mb-1">Height</label
            >
            <input
              id="custom-height"
              type="number"
              bind:value={customHeight}
              min="64"
              max="2048"
              step="64"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
          </div>
        </div>
      {/if}

      <!-- Maintain Aspect Ratio -->
      <div class="flex items-center">
        <input
          type="checkbox"
          bind:checked={maintainAspectRatio}
          id="maintain-aspect"
          class="mr-2"
          disabled={isProcessing}
        />
        <label for="maintain-aspect" class="text-sm font-medium text-gray-700">
          Maintain aspect ratio
        </label>
      </div>

      <!-- Optimize SVG -->
      {#if outputFormat === "svg"}
        <div class="flex items-center">
          <input
            type="checkbox"
            bind:checked={optimizeSvg}
            id="optimize-svg"
            class="mr-2"
            disabled={isProcessing}
          />
          <label for="optimize-svg" class="text-sm font-medium text-gray-700">
            Optimize SVG paths
          </label>
        </div>
      {/if}
    </div>
  </div>

  <!-- Processing Status -->
  {#if isProcessing}
    <div class="processing-status mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Processing...</span>
        <span class="text-sm text-gray-500">{processingProgress}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style="width: {processingProgress}%"
        ></div>
      </div>
    </div>
  {/if}

  <!-- Error Display -->
  {#if error}
    <div
      class="error-message mb-6 p-4 bg-red-50 border border-red-200 rounded-md"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Results -->
  {#if processedResult}
    <div class="results mb-6">
      <h4 class="text-md font-medium mb-3">Processed Result</h4>
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Preview -->
          <div class="flex-1">
            <h5 class="text-sm font-medium text-gray-700 mb-2">Preview</h5>
            <div class="bg-white p-4 rounded border max-w-xs mx-auto">
              <img
                src={processedResult.processedImage}
                alt="Processed tattoo"
                class="max-w-full h-auto"
                style="background: {outputFormat === 'png'
                  ? backgroundColor
                  : 'transparent'}"
              />
            </div>
          </div>

          <!-- Metadata -->
          <div class="flex-1">
            <h5 class="text-sm font-medium text-gray-700 mb-2">Details</h5>
            <div class="text-sm text-gray-600 space-y-1">
              <div>
                Format: <span class="font-medium"
                  >{processedResult.format.toUpperCase()}</span
                >
              </div>
              <div>
                Original: {processedResult.originalDimensions.width} × {processedResult
                  .originalDimensions.height}
              </div>
              <div>
                Processed: {processedResult.processedDimensions.width} × {processedResult
                  .processedDimensions.height}
              </div>
              <div>
                Processing time: {processedResult.metadata.processingTime}ms
              </div>
              <div>
                Optimizations: {processedResult.metadata.optimizationsApplied.join(
                  ", "
                )}
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-4 flex gap-2">
          <button
            on:click={downloadResult}
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Download {processedResult.format.toUpperCase()}
          </button>
          <button
            on:click={reset}
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Process Another
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Preview Original -->
  {#if previewImage && !processedResult}
    <div class="preview mb-6">
      <h4 class="text-md font-medium mb-3">Original Image</h4>
      <div class="bg-gray-50 p-4 rounded-lg">
        <img
          src={previewImage}
          alt="Original tattoo"
          class="max-w-xs mx-auto h-auto"
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .tattoo-processor {
    @apply max-w-4xl mx-auto p-6 bg-white;
  }

  .upload-methods {
    @apply border border-gray-200 rounded-lg p-4 bg-white;
  }

  .processing-options {
    @apply border border-gray-200 rounded-lg p-4 bg-white;
  }

  .upload-section {
    @apply p-3 border border-gray-100 rounded-md bg-gray-50;
  }

  input[type="range"] {
    @apply appearance-none bg-gray-200 rounded-lg h-2;
  }

  input[type="range"]::-webkit-slider-thumb {
    @apply appearance-none w-4 h-4 bg-blue-600 rounded-full cursor-pointer;
  }

  input[type="range"]::-moz-range-thumb {
    @apply w-4 h-4 bg-blue-600 rounded-full cursor-pointer border-0;
  }
</style>
