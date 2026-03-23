<script lang="ts">
  import WorldMap from '$lib/components/WorldMap.svelte'
  import TableView from '$lib/components/TableView.svelte'
  import FormatMatrix from '$lib/components/FormatMatrix.svelte'
  import DetailPanel from '$lib/components/DetailPanel.svelte'
  import CompareView from '$lib/components/CompareView.svelte'
  import StatsBar from '$lib/components/StatsBar.svelte'
  import SearchBar from '$lib/components/SearchBar.svelte'
  import Legend from '$lib/components/Legend.svelte'
  import ComplianceFilter from '$lib/components/ComplianceFilter.svelte'
  import GuidePanel from '$lib/components/GuidePanel.svelte'
  import ViewToggle from '$lib/components/ViewToggle.svelte'
  import { selectedCountry, selectedGuide, compareMode } from '$lib/stores/selection'
  import type { GuideInfo } from '$lib/data/compliance'
  import { viewMode, highlightMode } from '$lib/stores/filters'
  import { onDestroy } from 'svelte'

  let mode = $state<'map' | 'table' | 'matrix'>('map')
  let guide = $state<GuideInfo | null>(null)
  const unsubs = [
    viewMode.subscribe((v) => (mode = v)),
    selectedGuide.subscribe((v) => (guide = v))
  ]
  onDestroy(() => unsubs.forEach((u) => u()))

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      selectedCountry.set(null)
      selectedGuide.set(null)
      compareMode.set(false)
      highlightMode.set(null)
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
<StatsBar />
<main class="flex-1 relative flex flex-col overflow-hidden">
  {#if mode === 'map'}
    <div class="flex-1 relative">
      <WorldMap />
      <div class="absolute top-3 left-3 right-3 sm:right-auto sm:left-4 sm:top-4 z-10 flex flex-col sm:flex-row items-start gap-2">
        <SearchBar />
        <div class="flex items-center gap-2">
          <ViewToggle />
          <ComplianceFilter />
        </div>
      </div>
      <div class="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10">
        <Legend />
      </div>
    </div>
  {:else}
    <div
      class="px-3 sm:px-4 py-3 shrink-0 flex items-center gap-2"
      style="background: #06061a; border-bottom: 1px solid #141435;"
    >
      <SearchBar />
      <ViewToggle />
    </div>
    <div class="flex-1 overflow-hidden">
      {#if mode === 'table'}
        <TableView />
      {:else}
        <FormatMatrix />
      {/if}
    </div>
  {/if}
  <DetailPanel />
  <CompareView />
</main>
