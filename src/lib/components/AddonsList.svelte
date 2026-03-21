<script lang="ts">
  import type { Addon } from '$lib/types/addon'
  import { locName } from '$lib/utils/format'

  let { addons }: { addons: Addon[] } = $props()
</script>

<div>
  <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider mb-3">
    Addons & Formats
  </h4>
  <div class="space-y-1.5">
    {#each addons as addon}
      <div class="rounded-lg px-3 py-2.5" style="border: 1px solid #141435;">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-medium text-grey">{locName(addon.name)}</span>
          <span
            class="text-[10px] font-mono text-grey-dark px-1.5 py-0.5 rounded shrink-0"
            style="background: #141435;">{addon.key}</span
          >
        </div>
        {#if addon.description}
          <p class="text-xs text-grey-dim mt-1 leading-relaxed line-clamp-2">
            {locName(addon.description)}
          </p>
        {/if}
      </div>
    {/each}
  </div>
</div>
