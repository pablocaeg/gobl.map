<script lang="ts">
  import { copyToClipboard } from '$lib/utils/clipboard'

  let { text, label = '' }: { text: string; label?: string } = $props()
  let copied = $state(false)

  async function copy() {
    const ok = await copyToClipboard(text)
    if (ok) {
      copied = true
      setTimeout(() => (copied = false), 1500)
    }
  }
</script>

<button
  onclick={copy}
  class="inline-flex items-center gap-1 text-[11px] text-grey-dim hover:text-blue transition-colors"
  title="Copy {label || text}"
>
  {#if copied}
    <svg class="w-3 h-3 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
    </svg>
    <span class="text-blue">Copied</span>
  {:else}
    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
    {#if label}<span>{label}</span>{/if}
  {/if}
</button>
