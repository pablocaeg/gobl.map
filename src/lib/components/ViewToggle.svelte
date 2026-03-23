<script lang="ts">
  import { viewMode, type ViewMode } from '$lib/stores/filters'

  let mode = $state<ViewMode>('map')
  viewMode.subscribe((v) => (mode = v))

  function setMode(m: ViewMode) {
    viewMode.set(m)
  }

  const tabs: { key: ViewMode; label: string }[] = [
    { key: 'map', label: 'Map' },
    { key: 'table', label: 'Table' },
    { key: 'matrix', label: 'Formats' }
  ]
</script>

<div
  class="inline-flex rounded-md overflow-hidden shrink-0"
  style="border: 1px solid #252548; background: #0a0a24;"
>
  {#each tabs as tab, i}
    <button
      class="px-4 sm:px-3 py-2.5 sm:py-1.5 text-xs sm:text-[11px] font-semibold tracking-wide transition-colors"
      style="background: {mode === tab.key ? '#6EC5EE' : 'transparent'}; color: {mode === tab.key
        ? '#080820'
        : '#94B2CD'}; {i > 0 ? 'border-left: 1px solid #252548;' : ''}"
      onclick={() => setMode(tab.key)}
    >
      {tab.label}
    </button>
  {/each}
</div>
