<script lang="ts">
  import { onDestroy } from 'svelte'
  import { highlightMode, type HighlightMode } from '$lib/stores/filters'

  let mode = $state<HighlightMode>(null)
  const unsub = highlightMode.subscribe((v) => (mode = v))
  onDestroy(unsub)

  function toggle(target: 'needs' | 'pending') {
    highlightMode.set(mode === target ? null : target)
  }
</script>

<div
  class="inline-flex rounded-md overflow-hidden shrink-0"
  style="border: 1px solid #252548; background: #0a0a24;"
>
  <button
    class="px-3 sm:px-3 py-2.5 sm:py-1.5 text-[11px] font-semibold tracking-wide transition-colors whitespace-nowrap"
    style="background: {mode === 'needs' ? '#ef4444' : 'transparent'}; color: {mode === 'needs' ? '#fff' : '#e87b7b'};"
    onclick={() => toggle('needs')}
    aria-pressed={mode === 'needs'}
  >
    <span class="sm:hidden">Needs</span>
    <span class="hidden sm:inline">Needs contribution</span>
  </button>
  <button
    class="px-3 sm:px-3 py-2.5 sm:py-1.5 text-[11px] font-semibold tracking-wide transition-colors whitespace-nowrap"
    style="border-left: 1px solid #252548; background: {mode === 'pending' ? '#F0B866' : 'transparent'}; color: {mode === 'pending' ? '#080820' : '#F0B866'};"
    onclick={() => toggle('pending')}
    aria-pressed={mode === 'pending'}
  >
    <span class="sm:hidden">PRs</span>
    <span class="hidden sm:inline">In progress</span>
  </button>
</div>
