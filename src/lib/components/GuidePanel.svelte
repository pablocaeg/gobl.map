<script lang="ts">
  import { fly } from 'svelte/transition'
  import { getComplianceLabel, getComplianceColor, type GuideInfo } from '$lib/data/compliance'
  import Flag from './Flag.svelte'

  let { guide, onclose }: { guide: GuideInfo; onclose: () => void } = $props()

  let details = $derived(
    [
      { label: 'Format', value: guide.format },
      { label: 'Infrastructure', value: guide.infrastructure },
      { label: 'Model', value: guide.model },
      { label: 'Tax Authority', value: guide.authority },
      { label: 'Archiving', value: guide.archiving },
      { label: 'E-Signature', value: guide.eSignature }
    ].filter((d) => d.value)
  )

</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape') onclose()
  }}
/>

<!-- Mobile backdrop -->
<button
  class="fixed inset-0 z-30 sm:hidden"
  style="background: rgba(4,4,33,0.6);"
  onclick={onclose}
  aria-label="Close panel"
></button>

<aside
  class="fixed right-0 top-0 h-full w-full sm:w-[420px] z-40 overflow-hidden flex flex-col"
  style="background: #0a0a24; border-left: 1px solid #1a1a3e; box-shadow: -8px 0 32px rgba(0,0,0,0.4);"
  transition:fly={{ x: 420, duration: 250, opacity: 1 }}
>
  <!-- Header -->
  <div
    class="px-5 py-3 flex items-center justify-between shrink-0"
    style="border-bottom: 1px solid #1a1a3e;"
  >
    <span class="text-[11px] font-semibold uppercase tracking-widest" style="color: #e87b7b;"
      >Needs Contribution</span
    >
    <button
      onclick={onclose}
      class="p-1.5 rounded-md text-grey-dim hover:text-grey transition-colors"
      aria-label="Close"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2.5"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto panel-scroll">
    <div class="p-5 space-y-5">
      <!-- Country header -->
      <div class="flex items-start gap-3">
        <Flag code={guide.code} size="lg" />
        <div>
          <h3 class="text-xl font-bold text-grey leading-tight">{guide.name}</h3>
          <span class="text-sm font-mono text-grey-dim">{guide.code}</span>
        </div>
      </div>

      <!-- Compliance status -->
      <div>
        <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider mb-3">
          E-Invoicing Status
        </h4>
        <div class="grid grid-cols-3 gap-2">
          {#each [
            { label: 'B2G', status: guide.b2g },
            { label: 'B2B', status: guide.b2b },
            { label: 'B2C', status: guide.b2c }
          ] as item}
            <div class="rounded-lg px-3 py-2.5 text-center" style="border: 1px solid #1a1a3e;">
              <div class="text-[10px] text-grey-dim mb-1">{item.label}</div>
              <div class="text-xs font-semibold" style="color: {getComplianceColor(item.status)};">
                {getComplianceLabel(item.status)}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Technical details -->
      {#if details.length > 0}
        <hr style="border-color: #141435; border-width: 0; border-top-width: 1px;" />
        <div>
          <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider mb-3">
            Technical Details
          </h4>
          <div class="space-y-2">
            {#each details as detail}
              <div class="flex items-start justify-between gap-4 px-3 py-2 rounded-lg" style="border: 1px solid #141435;">
                <span class="text-xs text-grey-dim shrink-0">{detail.label}</span>
                <span class="text-sm text-grey text-right">{detail.value}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Notes -->
      {#if guide.notes}
        <hr style="border-color: #141435; border-width: 0; border-top-width: 1px;" />
        <div>
          <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider mb-2">
            Notes
          </h4>
          <p class="text-sm text-grey-dim leading-relaxed">{guide.notes}</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Footer -->
  <div class="px-5 py-4 shrink-0" style="border-top: 1px solid #1a1a3e; background: #080820;">
    <a
      href="https://github.com/invopop/gobl"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center justify-center w-full py-2.5 px-4 rounded-md text-sm font-semibold transition-colors"
      style="background: #6EC5EE; color: #080820;"
      onmouseenter={(e) => (e.currentTarget.style.background = '#94B2CD')}
      onmouseleave={(e) => (e.currentTarget.style.background = '#6EC5EE')}
    >
      Contribute this Regime&nbsp;→
    </a>
  </div>
</aside>
