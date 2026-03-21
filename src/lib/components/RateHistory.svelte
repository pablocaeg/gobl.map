<script lang="ts">
  import type { RateDef } from '$lib/types/regime'
  import { locName, fmtPercent } from '$lib/utils/format'

  let { rate }: { rate: RateDef } = $props()
  let expanded = $state(false)

  let hasHistory = $derived(rate.values.length > 1)
</script>

{#if hasHistory}
  <button
    class="text-[10px] text-grey-dark hover:text-paleblue transition-colors mt-0.5"
    onclick={() => (expanded = !expanded)}
  >
    {expanded ? 'Hide' : 'Show'} history ({rate.values.length} entries)
  </button>

  {#if expanded}
    <div class="mt-1.5 ml-2 pl-3 space-y-1" style="border-left: 2px solid #1e1e42;">
      {#each rate.values as val, i}
        <div class="flex items-center gap-3 text-[11px]">
          <span class="text-grey-dark tabular-nums w-20 shrink-0">{val.since || 'Origin'}</span>
          <span
            class="font-medium tabular-nums {i === 0 && !val.disabled
              ? 'text-blue'
              : val.disabled
                ? 'text-grey-dark line-through'
                : 'text-paleblue'}">{fmtPercent(val.percent)}</span
          >
          {#if val.surcharge}
            <span class="text-grey-dark">+{fmtPercent(val.surcharge)} surcharge</span>
          {/if}
          {#if val.disabled}
            <span class="text-grey-dark italic">disabled</span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
{/if}
