<script lang="ts">
  import { regimeData } from '$lib/stores/regimes'
  import { selectedCountry } from '$lib/stores/selection'
  import { countryRegion, regionColors } from '$lib/data/regions'
  import { locName, countryFlag, currentRate, fmtPercent } from '$lib/utils/format'
  import type { CountryData } from '$lib/utils/data-loader'
  import type { Region } from '$lib/data/regions'

  let dataMap = $state<Map<string, CountryData>>(new Map())
  regimeData.subscribe((v) => (dataMap = v))

  type SortKey = 'name' | 'code' | 'rate' | 'currency' | 'addons' | 'categories'
  let sortKey = $state<SortKey>('name')
  let sortAsc = $state(true)

  function getStandardRate(data: CountryData): number {
    for (const cat of data.regime.categories) {
      if (cat.code === 'VAT' || cat.code === 'GST') {
        const stdRate = cat.rates?.find((r) => r.rate === 'standard' || r.rate === 'general')
        if (stdRate) {
          const val = currentRate(stdRate.values)
          if (val) return parseFloat(val.percent)
        }
        // fallback: first rate
        if (cat.rates && cat.rates.length > 0) {
          const val = currentRate(cat.rates[0].values)
          if (val) return parseFloat(val.percent)
        }
      }
    }
    return 0
  }

  function getStandardRateStr(data: CountryData): string {
    const rate = getStandardRate(data)
    return rate > 0 ? fmtPercent(rate + '%') : '—'
  }

  let rows = $derived.by(() => {
    const arr = [...dataMap.values()]
    arr.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = locName(a.regime.name).localeCompare(locName(b.regime.name))
          break
        case 'code':
          cmp = a.countryCode.localeCompare(b.countryCode)
          break
        case 'rate':
          cmp = getStandardRate(a) - getStandardRate(b)
          break
        case 'currency':
          cmp = a.regime.currency.localeCompare(b.regime.currency)
          break
        case 'addons':
          cmp = a.addons.length - b.addons.length
          break
        case 'categories':
          cmp = a.regime.categories.length - b.regime.categories.length
          break
      }
      return sortAsc ? cmp : -cmp
    })
    return arr
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      sortAsc = !sortAsc
    } else {
      sortKey = key
      sortAsc = true
    }
  }

  function selectRow(data: CountryData) {
    selectedCountry.set(data)
  }

  function sortIcon(key: SortKey): string {
    if (sortKey !== key) return '↕'
    return sortAsc ? '↑' : '↓'
  }
</script>

<div class="h-full overflow-auto panel-scroll">
  <table class="w-full text-sm">
    <thead class="sticky top-0 z-10" style="background: #06061a;">
      <tr style="border-bottom: 1px solid #1a1a3e;">
        <th class="text-left px-4 py-3">
          <button
            class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider hover:text-blue transition-colors"
            onclick={() => toggleSort('name')}
          >
            Country {sortIcon('name')}
          </button>
        </th>
        <th class="text-left px-3 py-3 hidden sm:table-cell">
          <button
            class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider hover:text-blue transition-colors"
            onclick={() => toggleSort('code')}
          >
            Code {sortIcon('code')}
          </button>
        </th>
        <th class="text-left px-3 py-3">
          <span class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider"
            >Scheme</span
          >
        </th>
        <th class="text-right px-3 py-3">
          <button
            class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider hover:text-blue transition-colors"
            onclick={() => toggleSort('rate')}
          >
            Std Rate {sortIcon('rate')}
          </button>
        </th>
        <th class="text-left px-3 py-3 hidden md:table-cell">
          <button
            class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider hover:text-blue transition-colors"
            onclick={() => toggleSort('currency')}
          >
            Currency {sortIcon('currency')}
          </button>
        </th>
        <th class="text-right px-3 py-3 hidden md:table-cell">
          <button
            class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider hover:text-blue transition-colors"
            onclick={() => toggleSort('categories')}
          >
            Categories {sortIcon('categories')}
          </button>
        </th>
        <th class="text-right px-4 py-3 hidden lg:table-cell">
          <button
            class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider hover:text-blue transition-colors"
            onclick={() => toggleSort('addons')}
          >
            Addons {sortIcon('addons')}
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row}
        {@const region = countryRegion[row.countryCode] as Region}
        <tr
          class="cursor-pointer transition-colors"
          style="border-bottom: 1px solid #0e0e2a;"
          onclick={() => selectRow(row)}
          onmouseenter={(e) => (e.currentTarget.style.background = '#0e0e2a')}
          onmouseleave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <td class="px-4 py-2.5">
            <div class="flex items-center gap-2.5">
              {#if region}
                <span
                  class="w-1.5 h-1.5 rounded-full shrink-0"
                  style="background: {regionColors[region]}"
                ></span>
              {/if}
              <span class="text-lg leading-none">{countryFlag(row.countryCode)}</span>
              <span class="font-medium text-grey">{locName(row.regime.name)}</span>
            </div>
          </td>
          <td class="px-3 py-2.5 hidden sm:table-cell">
            <span class="font-mono text-xs text-grey-dim">{row.countryCode}</span>
          </td>
          <td class="px-3 py-2.5">
            {#if row.regime.tax_scheme}
              <span
                class="text-[11px] font-medium text-blue px-1.5 py-0.5 rounded"
                style="background: #6EC5EE10;">{row.regime.tax_scheme}</span
              >
            {:else}
              <span class="text-grey-dark">—</span>
            {/if}
          </td>
          <td class="px-3 py-2.5 text-right">
            <span class="font-bold text-grey tabular-nums">{getStandardRateStr(row)}</span>
          </td>
          <td class="px-3 py-2.5 hidden md:table-cell">
            <span class="font-mono text-xs text-grey-dim">{row.regime.currency}</span>
          </td>
          <td class="px-3 py-2.5 text-right hidden md:table-cell">
            <span class="text-grey-dim tabular-nums">{row.regime.categories.length}</span>
          </td>
          <td class="px-4 py-2.5 text-right hidden lg:table-cell">
            <span class="text-grey-dim tabular-nums">{row.addons.length}</span>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
