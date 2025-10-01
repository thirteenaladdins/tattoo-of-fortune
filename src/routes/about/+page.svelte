<!--
  about/+page.svelte
  About page with story and human touch
-->
<script>
  import { copy } from "$lib/data/copy";
</script>

<svelte:head>
  <title>{copy.ABOUT_TITLE}</title>
  <meta
    name="description"
    content="Learn about Tattoo of Fortune and our curated mystery tattoo designs."
  />
</svelte:head>

<div class="min-h-screen py-16 px-6 page-transition-enter">
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="text-center mb-16">
      <h1
        class="text-4xl md:text-6xl font-serif font-bold text-white mb-6 tracking-wide"
      >
        {copy.ABOUT_TITLE}
      </h1>
      <div
        class="w-24 h-1 bg-gradient-to-r from-purple-600 to-purple-700 mx-auto rounded-full"
      ></div>
    </div>

    <!-- Content Sections -->
    <div class="space-y-12">
      <!-- Story Section -->
      <section class="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
        <h2 class="text-2xl font-serif font-bold text-white mb-4 tracking-wide">
          Our Story
        </h2>
        <p class="text-gray-200 leading-relaxed mb-4">
          {copy.ABOUT_CONTENT}
        </p>
        <p class="text-gray-200 leading-relaxed"></p>
      </section>

      <!-- Process Section -->
      <section class="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
        <h2 class="text-2xl font-serif font-bold text-white mb-4 tracking-wide">
          The Process
        </h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="text-center">
            <div
              class="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <span class="text-white font-bold text-xl">1</span>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Roll</h3>
            <p class="text-gray-300 text-sm">
              Click to roll and let fate choose your design
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <span class="text-white font-bold text-xl">2</span>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Reveal</h3>
            <p class="text-gray-300 text-sm">
              Discover your unique tattoo fortune
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <span class="text-white font-bold text-xl">3</span>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Create</h3>
            <p class="text-gray-300 text-sm">
              Get your stencil-ready file and bring it to life
            </p>
          </div>
        </div>
      </section>

      <!-- Values Section -->
      <section class="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
        <h2 class="text-2xl font-serif font-bold text-white mb-4 tracking-wide">
          Our Values
        </h2>
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-white mb-2">Quality First</h3>
            <p class="text-gray-300 text-sm">
              Every design is hand-curated and optimized for tattoo application
            </p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white mb-2">
              Mystery & Magic
            </h3>
            <p class="text-gray-300 text-sm">
              Let fate guide your tattoo journey with our curated selection
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</div>

<!-- TODO: Add team photos or artist spotlights -->
<!-- TODO: Include testimonials or reviews -->
<!-- TODO: Add contact information or social links -->
