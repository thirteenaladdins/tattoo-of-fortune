<!--
  +layout.svelte
  Global shell: BackgroundArt + nav + footer
-->
<script lang="ts">
  import "../styles/app.css";
  import { page } from "$app/stores";
  import { fade, fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import BackgroundArt from "$lib/components/BackgroundArt.svelte";
  import Logo from "$lib/components/Logo.svelte";
  import { copy } from "$lib/data/copy";

  let isMobileMenuOpen = false;

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }

  function closeMobileMenu() {
    isMobileMenuOpen = false;
  }

  function navigateTo(path: string) {
    goto(path);
    closeMobileMenu();
  }

  // Close mobile menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      isMobileMenuOpen &&
      !target.closest("nav") &&
      !target.closest("button")
    ) {
      closeMobileMenu();
    }
  }

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });
</script>

<svelte:head>
  <title>Tattoo of Fortune</title>
  <meta
    name="description"
    content="Your next tattoo, chosen by fate. Mystery flash designs delivered by the universe."
  />
</svelte:head>

<!-- Background Art -->
<BackgroundArt />

<!-- Main Layout -->
<div class="min-h-screen flex flex-col">
  <!-- Navigation -->
  <nav class="relative z-50 p-6">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <!-- Logo -->
      <a href="/" class="hover:opacity-80 transition-opacity">
        <Logo size="md" />
      </a>

      <!-- Right side badges and nav -->
      <div class="flex items-center gap-4">
        <!-- Navigation Links -->
        <div class="hidden sm:flex items-center gap-6">
          <a
            href="/"
            on:click|preventDefault={() => navigateTo("/")}
            class="text-gray-300 hover:text-purple-400 transition-all duration-300 font-medium hover:scale-105"
          >
            Home
          </a>
          <a
            href="/about"
            on:click|preventDefault={() => navigateTo("/about")}
            class="text-gray-300 hover:text-purple-400 transition-all duration-300 font-medium hover:scale-105"
          >
            {copy.NAV_ABOUT}
          </a>
          <a
            href="/faq"
            on:click|preventDefault={() => navigateTo("/faq")}
            class="text-gray-300 hover:text-purple-400 transition-all duration-300 font-medium hover:scale-105"
          >
            {copy.NAV_FAQ}
          </a>
          <a
            href="/process-demo"
            on:click|preventDefault={() => navigateTo("/process-demo")}
            class="text-gray-300 hover:text-purple-400 transition-all duration-300 font-medium hover:scale-105"
          >
            Process Demo
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <div class="sm:hidden">
          <button
            on:click={toggleMobileMenu}
            class="p-2 rounded-lg border border-white/10 bg-white/5 text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <span class="text-2xl font-bold">
              {isMobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    {#if isMobileMenuOpen}
      <div
        class="fixed top-20 left-0 right-0 bg-white/5 backdrop-blur-sm border-t border-white/10 z-50"
        transition:fly={{ y: -20, duration: 200 }}
      >
        <div class="p-6 space-y-2">
          <a
            href="/"
            on:click|preventDefault={() => navigateTo("/")}
            class="block text-gray-300 hover:text-purple-400 transition-colors font-medium py-2"
          >
            Home
          </a>
          <a
            href="/about"
            on:click|preventDefault={() => navigateTo("/about")}
            class="block text-gray-300 hover:text-purple-400 transition-colors font-medium py-2"
          >
            {copy.NAV_ABOUT}
          </a>
          <a
            href="/faq"
            on:click|preventDefault={() => navigateTo("/faq")}
            class="block text-gray-300 hover:text-purple-400 transition-colors font-medium py-2"
          >
            {copy.NAV_FAQ}
          </a>
          <a
            href="/process-demo"
            on:click|preventDefault={() => navigateTo("/process-demo")}
            class="block text-gray-300 hover:text-purple-400 transition-colors font-medium py-2"
          >
            Process Demo
          </a>
        </div>
      </div>
    {/if}
  </nav>

  <!-- Main Content with Page Transitions -->
  <main class="flex-1 relative z-0">
    <div class="page-transition-wrapper">
      <slot />
    </div>
  </main>

  <!-- Footer -->
  <footer class="relative z-10 p-6 border-t border-white/20">
    <div class="max-w-7xl mx-auto text-center">
      <p class="text-gray-600 text-sm mb-2 font-light tracking-wide">
        {copy.FOOTER_DESCRIPTION}
      </p>
      <p class="text-gray-500 text-xs font-light tracking-wide">
        {copy.FOOTER_COPYRIGHT}
      </p>
    </div>
  </footer>
</div>

<!-- TODO: Add mobile navigation menu -->
<!-- TODO: Implement scroll-based nav transparency -->
<!-- TODO: Add footer animations -->
