<!--
  faq/+page.svelte
  FAQ page with common questions and policies
-->
<script lang="ts">
  import { copy } from "$lib/data/copy";

  type FAQItem = {
    question: string;
    answer: string;
  };

  // TODO: Expand with actual FAQ content
  const faqs: FAQItem[] = [
    {
      question: "What does 'fortune' mean in this context?",
      answer: "Your fortune is the tattoo design that fate has chosen for you.",
    },
    {
      question: "What file format do I receive?",
      answer:
        "You'll receive a high-resolution PNG file optimized for tattoo stencil creation, along with usage guidelines.",
    },
    {
      question: "Can I request revisions to my design?",
      answer:
        "The designs are final as they represent your fortune. However, you can always roll again for a different design if you're not satisfied.",
    },
    {
      question: "How quickly will I receive my file?",
      answer:
        "Your stencil-ready file is delivered immediately after successful payment via Stripe checkout.",
    },
    {
      question: "What's your refund policy?",
      answer:
        "Due to the digital nature of the product, we offer store credit for future rolls rather than refunds. Contact us if you have issues.",
    },
    {
      question: "Can I use the design for commercial purposes?",
      answer:
        "The license is for personal tattoo use only. Commercial use requires separate licensing - contact us for details.",
    },
    {
      question: "How often do you add new designs?",
      answer:
        "We regularly curate new designs to keep the mystery fresh. Follow us for updates on new additions to the fortune pool.",
    },
  ];

  let openIndex: number | null = null;

  function toggleFAQ(index: number) {
    openIndex = openIndex === index ? null : index;
  }
</script>

<svelte:head>
  <title>{copy.FAQ_TITLE}</title>
  <meta
    name="description"
    content="Frequently asked questions about Tattoo of Fortune mystery tattoo designs."
  />
</svelte:head>

<div class="min-h-screen py-16 px-6 page-transition-enter">
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="text-center mb-16">
      <h1
        class="text-4xl md:text-6xl font-serif font-bold text-white mb-6 tracking-wide"
      >
        {copy.FAQ_TITLE}
      </h1>
      <div
        class="w-24 h-1 bg-gradient-to-r from-purple-600 to-purple-700 mx-auto rounded-full"
      ></div>
    </div>

    <!-- FAQ Content -->
    <div class="space-y-4">
      {#each faqs as faq, index}
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
          <button
            on:click={() => toggleFAQ(index)}
            class="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
          >
            <h3 class="text-lg font-semibold text-white pr-4">
              {faq.question}
            </h3>
            <span
              class="text-white text-xl transform transition-transform duration-200 {openIndex ===
              index
                ? 'rotate-45'
                : ''}"
            >
              +
            </span>
          </button>

          {#if openIndex === index}
            <div class="px-6 pb-6">
              <p class="text-gray-200 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Contact Section -->
    <div class="mt-16 text-center">
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
        <h2 class="text-2xl font-serif font-bold text-white mb-4 tracking-wide">
          Still Have Questions?
        </h2>
        <p class="text-gray-200 mb-6 font-light tracking-wide">
          Can't find what you're looking for? We're here to help.
        </p>
        <!-- TODO: Add contact form or email link -->
        <a
          href="mailto:hello@tattooofortune.com"
          class="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
        >
          Contact Us
        </a>
      </div>
    </div>
  </div>
</div>

<!-- TODO: Add search functionality for FAQs -->
<!-- TODO: Implement smooth accordion animations -->
<!-- TODO: Add FAQ categories or tags -->
