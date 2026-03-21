<script lang="ts">
  import type { Source } from '$lib/types/regime'
  import { locName } from '$lib/utils/format'

  let { sources }: { sources: Source[] } = $props()
</script>

<div>
  <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider mb-3">
    Official Sources
  </h4>
  <div class="space-y-1">
    {#each sources as source}
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-paleblue hover:text-blue transition-colors group"
      >
        <svg
          class="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-80 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
        <span class="text-sm leading-snug">{locName(source.title)}</span>
      </a>
    {/each}
  </div>
</div>
