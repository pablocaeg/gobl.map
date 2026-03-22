<script lang="ts">
  import WorldMap from '$lib/components/WorldMap.svelte'
  import TableView from '$lib/components/TableView.svelte'
  import FormatMatrix from '$lib/components/FormatMatrix.svelte'
  import DetailPanel from '$lib/components/DetailPanel.svelte'
  import CompareView from '$lib/components/CompareView.svelte'
  import GuidePanel from '$lib/components/GuidePanel.svelte'
  import { selectedGuide } from '$lib/stores/selection'
  import type { GuideInfo } from '$lib/data/compliance'

  let guide = $state<GuideInfo | null>(null)
  selectedGuide.subscribe((v) => (guide = v))
  import StatsBar from '$lib/components/StatsBar.svelte'
  import SearchBar from '$lib/components/SearchBar.svelte'
  import Legend from '$lib/components/Legend.svelte'
  import ViewToggle from '$lib/components/ViewToggle.svelte'
  import { viewMode } from '$lib/stores/filters'

  let mode = $state<'map' | 'table' | 'matrix'>('map')
  viewMode.subscribe((v) => (mode = v))
</script>

<StatsBar />
<main class="flex-1 relative flex flex-col overflow-hidden">
  {#if mode === 'map'}
    <div class="flex-1 relative">
      <WorldMap />
      <div class="absolute top-4 left-4 z-10 flex items-center gap-2">
        <SearchBar />
        <ViewToggle />
      </div>
      <div class="absolute bottom-4 left-4 z-10">
        <Legend />
      </div>
    </div>
  {:else}
    <div
      class="px-4 py-3 shrink-0 flex items-center gap-2"
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
  {#if guide}
    <GuidePanel {guide} onclose={() => selectedGuide.set(null)} />
  {/if}
  <CompareView />
</main>
