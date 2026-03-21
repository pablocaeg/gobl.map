<script lang="ts">
  import { regionColors } from '$lib/data/regions'
</script>

<div
  class="rounded-lg border px-3.5 py-2.5"
  style="background: #0e0e2acc; border-color: #2a2a50; backdrop-filter: blur(12px);"
>
  <div class="text-[10px] font-semibold text-grey-dim uppercase tracking-wider mb-2">
    Coverage by Region
  </div>
  <div class="space-y-1.5">
    {#each Object.entries(regionColors) as [region, color]}
      <div class="flex items-center gap-2">
        <span class="w-3 h-2 rounded-sm shrink-0" style="background: {color}"></span>
        <span class="text-xs text-paleblue">{region}</span>
      </div>
    {/each}
    <div class="flex items-center gap-2">
      <span class="w-3 h-2 rounded-sm shrink-0" style="background: #161636"></span>
      <span class="text-xs text-grey-dim">Not yet supported</span>
    </div>
  </div>
</div>
