<script lang="ts">
  import type { CountryData } from '$lib/utils/data-loader'
  import { locName, countryFlag } from '$lib/utils/format'
  import { countryRegion, regionColors } from '$lib/data/regions'
  import type { Region } from '$lib/data/regions'
  import CopyButton from './CopyButton.svelte'

  let { country }: { country: CountryData } = $props()

  let region = $derived(countryRegion[country.countryCode] as Region | undefined)
  let regionColor = $derived(region ? regionColors[region] : '')
</script>

<div>
  <div class="flex items-start gap-3 mb-4">
    <span class="text-4xl leading-none mt-0.5">{countryFlag(country.countryCode)}</span>
    <div class="flex-1">
      <h3 class="text-xl font-bold text-grey leading-tight">{locName(country.regime.name)}</h3>
      <div class="flex items-center gap-2 mt-1">
        <span class="text-sm font-mono text-grey-dim">{country.countryCode}</span>
        <CopyButton text={country.countryCode} />
        {#if country.regime.tax_scheme}
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold text-blue"
            style="background: #6EC5EE15;"
          >
            {country.regime.tax_scheme}
          </span>
        {/if}
      </div>
    </div>
  </div>

  <div class="flex flex-wrap gap-2 mb-3">
    <div
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
      style="background: #1a1a3e;"
    >
      <svg class="w-3.5 h-3.5 text-grey-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span class="text-xs font-medium text-paleblue">{country.regime.currency}</span>
    </div>
    <div
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
      style="background: #1a1a3e;"
    >
      <svg class="w-3.5 h-3.5 text-grey-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span class="text-xs font-medium text-paleblue">{country.regime.time_zone}</span>
    </div>
    {#if region}
      <div
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
        style="background: #1a1a3e;"
      >
        <span class="w-2 h-2 rounded-full" style="background: {regionColor}"></span>
        <span class="text-xs font-medium text-paleblue">{region}</span>
      </div>
    {/if}
  </div>

  {#if country.regime.description}
    {@const firstParagraph = locName(country.regime.description).split('\n\n')[0]}
    <p class="text-sm text-grey-dim leading-relaxed">{firstParagraph}</p>
  {/if}
</div>
