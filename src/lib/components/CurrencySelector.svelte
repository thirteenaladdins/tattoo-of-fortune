<!--
  CurrencySelector.svelte
  Small currency selector for payment modal
-->
<script lang="ts">
  import {
    detectUserCurrency,
    setUserCurrency,
    getCurrencyInfo,
    type Currency,
  } from "$lib/utils/currency";
  import { onMount } from "svelte";

  export let selectedCurrency: Currency = "gbp";
  export let onCurrencyChange: (currency: Currency) => void = () => {};

  let isOpen = false;
  let availableCurrencies: Currency[] = ["gbp", "usd", "eur"];

  function handleCurrencySelect(currency: Currency) {
    selectedCurrency = currency;
    setUserCurrency(currency);
    onCurrencyChange(currency);
    isOpen = false;
  }

  onMount(async () => {
    const detected = await detectUserCurrency();
    selectedCurrency = detected;
    onCurrencyChange(detected);
  });
</script>

<div class="relative">
  <button
    on:click={() => (isOpen = !isOpen)}
    class="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
  >
    <span>{getCurrencyInfo(selectedCurrency).symbol}</span>
    <span class="text-xs">▼</span>
  </button>

  {#if isOpen}
    <div
      class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[80px]"
    >
      {#each availableCurrencies as currency}
        <button
          on:click={() => handleCurrencySelect(currency)}
          class="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
          class:bg-purple-50={selectedCurrency === currency}
        >
          <span>{getCurrencyInfo(currency).symbol}</span>
          <span class="text-xs uppercase">{currency}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
