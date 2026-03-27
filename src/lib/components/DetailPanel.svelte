<script lang="ts">
  import { onDestroy } from 'svelte'
  import { selectedCountry, compareCountry, compareMode } from '$lib/stores/selection'
  import { get } from 'svelte/store'
  import { fly } from 'svelte/transition'
  import RegimeHeader from './RegimeHeader.svelte'
  import TaxCategories from './TaxCategories.svelte'
  import AddonsList from './AddonsList.svelte'
  import IdentitiesList from './IdentitiesList.svelte'
  import SourceLinks from './SourceLinks.svelte'
  import GoblEditor from './GoblEditor.svelte'
  import type { CountryData } from '$lib/utils/data-loader'

  let country = $state<CountryData | null>(null)
  const unsub = selectedCountry.subscribe((v) => (country = v))
  onDestroy(unsub)

  function close() {
    selectedCountry.set(null)
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !get(compareMode)) close()
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if country}
  <!-- Mobile-only backdrop -->
  <button
    class="fixed inset-0 z-30 sm:hidden"
    style="background: rgba(4,4,33,0.6);"
    onclick={close}
    aria-label="Close panel"
  ></button>

  <aside
    class="fixed right-0 top-0 h-full w-full sm:w-[420px] z-40 overflow-hidden flex flex-col"
    style="background: #0a0a24; border-left: 1px solid #1a1a3e; box-shadow: -8px 0 32px rgba(0,0,0,0.4);"
    transition:fly={{ x: 420, duration: 250, opacity: 1 }}
  >
    <!-- Header -->
    <div
      class="px-5 py-3 flex items-center justify-between shrink-0"
      style="border-bottom: 1px solid #1a1a3e;"
    >
      <span class="text-[11px] font-semibold text-grey-dim uppercase tracking-widest"
        >Regime Details</span
      >
      <button
        onclick={close}
        class="p-1.5 rounded-md text-grey-dim hover:text-grey transition-colors"
        aria-label="Close"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto panel-scroll">
      <div class="p-5 space-y-5">
        <RegimeHeader {country} />

        <hr style="border-color: #141435; border-width: 0; border-top-width: 1px;" />
        <TaxCategories categories={country.regime.categories} />

        {#if country.addons.length > 0}
          <hr style="border-color: #141435; border-width: 0; border-top-width: 1px;" />
          <AddonsList addons={country.addons} />
        {/if}

        {#if country.regime.identities && country.regime.identities.length > 0}
          <hr style="border-color: #141435; border-width: 0; border-top-width: 1px;" />
          <IdentitiesList identities={country.regime.identities} />
        {/if}

        {#if country.regime.corrections && country.regime.corrections.length > 0}
          <hr style="border-color: #141435; border-width: 0; border-top-width: 1px;" />
          <div>
            <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider mb-2.5">
              Corrections
            </h4>
            <div class="flex flex-wrap gap-1.5">
              {#each country.regime.corrections as correction}
                {#each correction.types as type}
                  <span
                    class="text-xs px-2.5 py-1 rounded-md font-medium text-paleblue"
                    style="background: #141435;">{type}</span
                  >
                {/each}
              {/each}
            </div>
          </div>
        {/if}

        {#if country.regime.sources && country.regime.sources.length > 0}
          <hr style="border-color: #141435; border-width: 0; border-top-width: 1px;" />
          <SourceLinks sources={country.regime.sources} />
        {/if}

        <hr style="border-color: #141435; border-width: 0; border-top-width: 1px;" />
        <GoblEditor {country} />
      </div>
    </div>

    <!-- Footer -->
    <div
      class="px-5 py-4 shrink-0 flex gap-2"
      style="border-top: 1px solid #1a1a3e; background: #080820;"
    >
      <button
        onclick={() => {
          compareCountry.set(null)
          compareMode.set(true)
        }}
        class="flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-semibold transition-colors"
        style="background: #141435; color: #94B2CD; border: 1px solid #1e1e42;"
        onmouseenter={(e) => (e.currentTarget.style.background = '#1e1e42')}
        onmouseleave={(e) => (e.currentTarget.style.background = '#141435')}
      >
        Compare
      </button>
      <a
        href="https://docs.gobl.org/regimes/{country.regime.country.toLowerCase()}"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-1 flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-semibold transition-colors"
        style="background: #6EC5EE; color: #080820;"
        onmouseenter={(e) => (e.currentTarget.style.background = '#94B2CD')}
        onmouseleave={(e) => (e.currentTarget.style.background = '#6EC5EE')}
      >
        Read the Docs&nbsp;→
      </a>
    </div>
  </aside>
{/if}
