<script lang="ts">
  import { regionColors } from '$lib/data/regions'

  let expanded = $state(false)
</script>

<!-- Desktop: always show full legend -->
<div
  class="hidden sm:block rounded-lg border px-3.5 py-2.5"
  style="background: #0e0e2acc; border-color: #2a2a50; backdrop-filter: blur(12px);"
>
  <div class="text-[10px] font-semibold text-grey-dim uppercase tracking-wider mb-2">
    Coverage
  </div>
  <div class="space-y-1.5">
    {#each Object.entries(regionColors) as [region, color]}
      <div class="flex items-center gap-2">
        <span class="w-3 h-2 rounded-sm shrink-0" style="background: {color}"></span>
        <span class="text-xs text-paleblue">{region}</span>
      </div>
    {/each}
    <div class="flex items-center gap-2">
      <span
        class="w-3 h-2 rounded-sm shrink-0"
        style="background: repeating-linear-gradient(45deg, #161640, #161640 2px, #2a2a5a 2px, #2a2a5a 4px);"
      ></span>
      <span class="text-xs" style="color: #F0B866;">PR open</span>
    </div>
    <div class="flex items-center gap-2">
      <span
        class="w-3 h-2 rounded-sm shrink-0"
        style="background: repeating-linear-gradient(45deg, #1a1020, #1a1020 2px, #3a1a30 2px, #3a1a30 4px);"
      ></span>
      <span class="text-xs" style="color: #e87b7b;">Needs contribution</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="w-3 h-2 rounded-sm shrink-0" style="background: #111130"></span>
      <span class="text-xs text-grey-dim">No requirement</span>
    </div>
  </div>
</div>

<!-- Mobile: collapsible legend -->
<div class="sm:hidden">
  <button
    class="rounded-lg border px-3 py-2 flex items-center gap-2"
    style="background: #0e0e2acc; border-color: #2a2a50; backdrop-filter: blur(12px);"
    onclick={() => (expanded = !expanded)}
    aria-expanded={expanded}
    aria-label="Toggle coverage legend"
  >
    <span class="text-[10px] font-semibold text-grey-dim uppercase tracking-wider">Legend</span>
    <svg
      class="w-3 h-3 text-grey-dim transition-transform"
      class:rotate-180={expanded}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      stroke-width="2.5"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  {#if expanded}
    <div
      class="mt-1.5 rounded-lg border px-3.5 py-2.5"
      style="background: #0e0e2acc; border-color: #2a2a50; backdrop-filter: blur(12px);"
    >
      <div class="space-y-1.5">
        {#each Object.entries(regionColors) as [region, color]}
          <div class="flex items-center gap-2">
            <span class="w-3 h-2 rounded-sm shrink-0" style="background: {color}"></span>
            <span class="text-xs text-paleblue">{region}</span>
          </div>
        {/each}
        <div class="flex items-center gap-2">
          <span
            class="w-3 h-2 rounded-sm shrink-0"
            style="background: repeating-linear-gradient(45deg, #161640, #161640 2px, #2a2a5a 2px, #2a2a5a 4px);"
          ></span>
          <span class="text-xs" style="color: #F0B866;">PR open</span>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="w-3 h-2 rounded-sm shrink-0"
            style="background: repeating-linear-gradient(45deg, #1a1020, #1a1020 2px, #3a1a30 2px, #3a1a30 4px);"
          ></span>
          <span class="text-xs" style="color: #e87b7b;">Needs contribution</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-2 rounded-sm shrink-0" style="background: #111130"></span>
          <span class="text-xs text-grey-dim">No requirement</span>
        </div>
      </div>
    </div>
  {/if}
</div>
