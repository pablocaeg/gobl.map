<script lang="ts">
  import type { Definition } from '$lib/types/regime'
  import { locName } from '$lib/utils/format'

  let { identities }: { identities: Definition[] } = $props()
</script>

<div>
  <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider mb-3">
    Identity Types
  </h4>
  <div class="space-y-1.5">
    {#each identities as identity}
      <div
        class="flex items-center justify-between px-3 py-2 rounded-lg"
        style="border: 1px solid #141435;"
      >
        <span class="text-sm text-paleblue">{locName(identity.name)}</span>
        <span class="text-[10px] font-mono text-grey-dark">{identity.key}</span>
      </div>
    {/each}
  </div>
</div>
