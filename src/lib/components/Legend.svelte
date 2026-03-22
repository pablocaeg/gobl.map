<script lang="ts">
  import { regionColors } from '$lib/data/regions'
</script>

<div
  class="rounded-lg border px-3.5 py-2.5"
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
      <span class="w-3 h-2 rounded-sm shrink-0" style="background: #1f1020"></span>
      <span class="text-xs" style="color: #ef4444;">Needs contribution</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="w-3 h-2 rounded-sm shrink-0" style="background: #111130"></span>
      <span class="text-xs text-grey-dim">No requirement</span>
    </div>
  </div>
</div>
