<script lang="ts">
  import type { CategoryDef } from '$lib/types/regime'
  import { locName, currentRate, fmtPercent } from '$lib/utils/format'
  import RateHistory from './RateHistory.svelte'

  let { categories }: { categories: CategoryDef[] } = $props()
  let expandedIdx = $state<number | null>(0)

  function toggle(idx: number) {
    expandedIdx = expandedIdx === idx ? null : idx
  }
</script>

<div>
  <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider mb-3">
    Tax Categories
  </h4>
  <div class="space-y-1.5">
    {#each categories as cat, idx}
      {@const isOpen = expandedIdx === idx}
      <div
        class="rounded-lg overflow-hidden"
        style="background: {isOpen ? '#0e0e2a' : 'transparent'}; border: 1px solid {isOpen
          ? '#1e1e42'
          : '#141435'};"
      >
        <button
          class="w-full flex items-center justify-between px-3 py-2 text-left transition-colors"
          onclick={() => toggle(idx)}
        >
          <div class="flex items-center gap-2">
            <span
              class="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded text-blue"
              style="background: #6EC5EE10;"
            >
              {cat.code}
            </span>
            <span class="text-sm font-medium text-grey">{locName(cat.name)}</span>
            {#if cat.retained}
              <span
                class="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase"
                style="background: #F0B86615; color: #F0B866;">Retained</span
              >
            {/if}
          </div>
          <svg
            class="w-3.5 h-3.5 text-grey-dark transition-transform duration-200 {isOpen
              ? 'rotate-180'
              : ''}"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {#if isOpen}
          <div class="px-3 pb-3" style="border-top: 1px solid #141435;">
            {#if cat.rates && cat.rates.length > 0}
              <div class="mt-2 space-y-0">
                {#each cat.rates as rate}
                  {@const current = currentRate(rate.values)}
                  {#if current}
                    <div class="flex items-center justify-between py-1.5">
                      <span class="text-sm text-paleblue">{locName(rate.name)}</span>
                      <div class="flex items-baseline gap-2">
                        <span class="text-sm font-bold text-grey tabular-nums"
                          >{fmtPercent(current.percent)}</span
                        >
                        {#if current.since}
                          <span class="text-[10px] text-grey-dark tabular-nums"
                            >{current.since}</span
                          >
                        {/if}
                      </div>
                    </div>
                    <RateHistory {rate} />
                  {/if}
                {/each}
              </div>
            {:else if cat.keys && cat.keys.length > 0}
              <div class="mt-2 flex flex-wrap gap-1.5">
                {#each cat.keys as key}
                  <span
                    class="text-xs px-2 py-0.5 rounded font-medium text-paleblue"
                    style="background: #141435;">{locName(key.name)}</span
                  >
                {/each}
              </div>
            {:else}
              <p class="text-xs text-grey-dark mt-2 italic">Custom rates</p>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
