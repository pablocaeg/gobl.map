<script lang="ts">
  import type { CountryData } from '$lib/utils/data-loader'
  import { workerReady, initWorker, buildDocument, type BuildResult } from '$lib/stores/worker'
  import { locName } from '$lib/utils/format'
  import CopyButton from './CopyButton.svelte'

  let { country }: { country: CountryData } = $props()

  let editorValue = $state('')
  let result = $state<BuildResult | null>(null)
  let loading = $state(false)
  let showOutput = $state(false)

  // Pre-generated mock invoices per country (from gobl.mock).
  const mockCache = new Map<string, string>()

  async function loadMockInvoice(code: string): Promise<string> {
    if (mockCache.has(code)) {
      return mockCache.get(code)!
    }
    try {
      const mod = await import(`$lib/data/examples/${code}.json`)
      // Extract just the invoice document (not the envelope).
      const doc = mod.default?.doc || mod.default
      const json = JSON.stringify(doc, null, 2)
      mockCache.set(code, json)
      return json
    } catch {
      // Fallback to a basic template if no mock available.
      const r = country.regime
      const cat = r.categories[0]
      const fallback = {
        $schema: 'https://gobl.org/draft-0/bill/invoice',
        currency: r.currency,
        supplier: {
          name: 'Test Supplier',
          tax_id: { country: r.country, code: 'XXXXXXXX' }
        },
        lines: [
          {
            quantity: '1',
            item: { name: 'Service', price: '100.00' },
            taxes: [{ cat: cat?.code || 'VAT', rate: 'standard' }]
          }
        ]
      }
      return JSON.stringify(fallback, null, 2)
    }
  }

  // Load mock invoice when country changes.
  $effect(() => {
    if (country) {
      result = null
      showOutput = false
      // Map EL -> GR for file lookup.
      const code = country.regime.country === 'EL' ? 'GR' : country.regime.country
      loadMockInvoice(code).then((json) => {
        editorValue = json
      })
    }
  })

  // Initialize worker on first mount.
  $effect(() => {
    if (!$workerReady) {
      initWorker()
    }
  })

  async function handleBuild() {
    loading = true
    result = null
    try {
      result = await buildDocument(editorValue)
      showOutput = true
    } finally {
      loading = false
    }
  }

  function handleReset() {
    result = null
    showOutput = false
    const code = country.regime.country === 'EL' ? 'GR' : country.regime.country
    loadMockInvoice(code).then((json) => {
      editorValue = json
    })
  }

  // Format nested error fields for display.
  function formatErrors(fields: Record<string, unknown>, prefix = ''): string[] {
    const lines: string[] = []
    for (const [key, value] of Object.entries(fields)) {
      const path = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'string') {
        lines.push(`${path}: ${value}`)
      } else if (typeof value === 'object' && value !== null) {
        lines.push(...formatErrors(value as Record<string, unknown>, path))
      }
    }
    return lines
  }
</script>

<div>
  <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider mb-2.5">
    Live Editor
  </h4>

  {#if !$workerReady}
    <div
      class="rounded-lg p-4 text-center text-xs text-grey-dark"
      style="background: #0a0a20; border: 1px solid #1e1e42;"
    >
      <div class="flex items-center justify-center gap-2">
        <svg class="animate-spin h-3.5 w-3.5 text-accent" viewBox="0 0 24 24" fill="none">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
        Loading GOBL engine...
      </div>
    </div>
  {:else}
    <div class="rounded-lg overflow-hidden" style="border: 1px solid #1e1e42;">
      <!-- Toolbar -->
      <div
        class="flex items-center justify-between px-3 py-1.5"
        style="background: #141435; border-bottom: 1px solid #1e1e42;"
      >
        <span class="text-[10px] font-mono text-grey-dark">
          {locName(country.regime.name)} — Edit & Validate
        </span>
        <div class="flex items-center gap-1.5">
          <button
            onclick={handleReset}
            class="text-[10px] px-2 py-0.5 rounded text-grey-dark hover:text-grey transition-colors"
            style="background: #0a0a20;"
          >
            Reset
          </button>
          <CopyButton text={editorValue} label="Copy" />
        </div>
      </div>

      <!-- Editor -->
      <textarea
        bind:value={editorValue}
        class="w-full p-3 text-xs font-mono text-paleblue leading-relaxed resize-none focus:outline-none"
        style="background: #0a0a20; border: none; min-height: 200px; max-height: 400px;"
        spellcheck="false"
      ></textarea>

      <!-- Build button -->
      <div class="px-3 py-2 flex gap-2" style="background: #141435; border-top: 1px solid #1e1e42;">
        <button
          onclick={handleBuild}
          disabled={loading}
          class="flex-1 flex items-center justify-center py-2 px-4 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
          style="background: #6EC5EE; color: #080820;"
          onmouseenter={(e) => {
            if (!loading) e.currentTarget.style.background = '#94B2CD'
          }}
          onmouseleave={(e) => (e.currentTarget.style.background = '#6EC5EE')}
        >
          {#if loading}
            Building...
          {:else}
            Build & Validate
          {/if}
        </button>
      </div>

      <!-- Result -->
      {#if result}
        <div style="border-top: 1px solid #1e1e42;">
          {#if result.ok}
            <div class="px-3 py-2 flex items-center gap-2" style="background: #0a2010;">
              <svg class="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-xs text-green-300 font-medium">Valid — invoice built successfully</span>
              <button
                onclick={() => (showOutput = !showOutput)}
                class="ml-auto text-[10px] text-green-400 hover:text-green-300"
              >
                {showOutput ? 'Hide' : 'Show'} output
              </button>
            </div>
            {#if showOutput}
              <pre
                class="p-3 text-[10px] text-paleblue leading-relaxed overflow-x-auto"
                style="background: #060618; margin: 0; max-height: 300px;"
              ><code>{result.output}</code></pre>
            {/if}
          {:else}
            <div class="px-3 py-2" style="background: #200a0a;">
              <div class="flex items-center gap-2 mb-1.5">
                <svg class="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-xs text-red-300 font-medium">Validation failed</span>
              </div>
              {#if result.errorFields}
                <div class="space-y-0.5">
                  {#each formatErrors(result.errorFields) as line}
                    <p class="text-[10px] font-mono text-red-300/80 pl-5">{line}</p>
                  {/each}
                </div>
              {:else if result.error}
                <p class="text-[10px] font-mono text-red-300/80 pl-5">{result.error}</p>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>
