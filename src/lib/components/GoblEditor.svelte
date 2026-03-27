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
  let expanded = $state(true)
  let textareaEl = $state<HTMLTextAreaElement | null>(null)
  let dirty = $state(false)
  let originalValue = $state('')

  const mockCache = new Map<string, string>()

  async function loadMockInvoice(code: string): Promise<string> {
    if (mockCache.has(code)) return mockCache.get(code)!
    try {
      const mod = await import(`$lib/data/examples/${code}.json`)
      const doc = mod.default?.doc || mod.default
      const json = JSON.stringify(doc, null, 2)
      mockCache.set(code, json)
      return json
    } catch {
      const r = country.regime
      const cat = r.categories[0]
      return JSON.stringify(
        {
          $schema: 'https://gobl.org/draft-0/bill/invoice',
          currency: r.currency,
          supplier: { name: 'Test Supplier', tax_id: { country: r.country, code: 'XXXXXXXX' } },
          lines: [
            {
              quantity: '1',
              item: { name: 'Service', price: '100.00' },
              taxes: [{ cat: cat?.code || 'VAT', rate: 'standard' }]
            }
          ]
        },
        null,
        2
      )
    }
  }

  $effect(() => {
    if (country) {
      result = null
      showOutput = false
      dirty = false
      const code = country.regime.country === 'EL' ? 'GR' : country.regime.country
      loadMockInvoice(code).then((json) => {
        editorValue = json
        originalValue = json
      })
    }
  })

  $effect(() => {
    if (!$workerReady) initWorker()
  })

  // Track edits.
  function handleInput() {
    dirty = editorValue !== originalValue
    result = null
    autoResize()
  }

  function autoResize() {
    if (!textareaEl) return
    textareaEl.style.height = 'auto'
    textareaEl.style.height = Math.min(textareaEl.scrollHeight, 500) + 'px'
  }

  // Resize on expand.
  $effect(() => {
    if (expanded && textareaEl) {
      requestAnimationFrame(autoResize)
    }
  })

  async function handleBuild() {
    loading = true
    result = null
    try {
      result = await buildDocument(editorValue)
      showOutput = result.ok
    } finally {
      loading = false
    }
  }

  function handleReset() {
    editorValue = originalValue
    result = null
    showOutput = false
    dirty = false
    requestAnimationFrame(autoResize)
  }

  // Cmd/Ctrl+Enter to build.
  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleBuild()
    }
  }

  // Tab key inserts 2 spaces instead of moving focus.
  function handleTab(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget as HTMLTextAreaElement
      const start = ta.selectionStart
      const end = ta.selectionEnd
      editorValue = editorValue.substring(0, start) + '  ' + editorValue.substring(end)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      })
    }
  }

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

  let lineCount = $derived(editorValue.split('\n').length)
</script>

<div>
  <!-- Section header — click to expand/collapse -->
  <button
    class="w-full flex items-center justify-between text-left group"
    onclick={() => (expanded = !expanded)}
  >
    <div class="flex items-center gap-2">
      <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider">
        Playground
      </h4>
      <span class="text-[9px] text-grey-dark/50 hidden sm:inline">— edit and validate live</span>
      {#if !expanded && result?.ok}
        <span
          class="inline-flex items-center gap-1 text-[9px] font-medium text-green-400 px-1.5 py-0.5 rounded"
          style="background: rgba(34,197,94,0.1);"
        >
          <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          Valid
        </span>
      {/if}
      {#if !expanded && result && !result.ok}
        <span
          class="inline-flex items-center gap-1 text-[9px] font-medium text-red-400 px-1.5 py-0.5 rounded"
          style="background: rgba(239,68,68,0.1);"
        >
          <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          Error
        </span>
      {/if}
    </div>
    <svg
      class="w-3.5 h-3.5 text-grey-dark transition-transform duration-200 {expanded
        ? 'rotate-180'
        : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if expanded}
    {#if !$workerReady}
      <div
        class="mt-2 rounded-lg p-4 text-center text-xs text-grey-dark"
        style="background: #0a0a20; border: 1px solid #1e1e42;"
      >
        <div class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-3.5 w-3.5 text-accent" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
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
      <div class="mt-2 rounded-lg overflow-hidden" style="border: 1px solid #1e1e42;">
        <!-- Toolbar -->
        <div
          class="flex items-center justify-between px-3 py-1.5"
          style="background: #141435; border-bottom: 1px solid #1e1e42;"
        >
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono text-grey-dark">
              {locName(country.regime.name)}
            </span>
            <span class="text-[9px] text-grey-dark/50">{lineCount} lines</span>
            {#if dirty}
              <span
                class="text-[9px] font-medium text-amber-400/70 px-1 rounded"
                style="background: rgba(245,158,11,0.08);">modified</span
              >
            {/if}
          </div>
          <div class="flex items-center gap-1.5">
            {#if dirty}
              <button
                onclick={handleReset}
                class="text-[10px] px-2 py-0.5 rounded text-grey-dark hover:text-grey transition-colors"
                style="background: #0a0a20;"
              >
                Reset
              </button>
            {/if}
            <CopyButton text={editorValue} label="Copy" />
          </div>
        </div>

        <!-- Editor area -->
        <div class="relative" style="background: #0a0a20;">
          <textarea
            bind:this={textareaEl}
            bind:value={editorValue}
            oninput={handleInput}
            onkeydown={(e) => {
              handleKeydown(e)
              handleTab(e)
            }}
            class="w-full p-3 pl-4 text-xs font-mono text-paleblue leading-relaxed resize-none focus:outline-none"
            style="background: transparent; border: none; min-height: 180px; max-height: 500px; tab-size: 2;"
            spellcheck="false"
            autocomplete="off"
          ></textarea>
        </div>

        <!-- Action bar -->
        <div
          class="px-3 py-2 flex items-center gap-2"
          style="background: #141435; border-top: 1px solid #1e1e42;"
        >
          <button
            onclick={handleBuild}
            disabled={loading}
            class="flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-md text-xs font-semibold transition-all disabled:opacity-50"
            style="background: #6EC5EE; color: #080820;"
            onmouseenter={(e) => {
              if (!loading) e.currentTarget.style.background = '#94B2CD'
            }}
            onmouseleave={(e) => (e.currentTarget.style.background = '#6EC5EE')}
          >
            {#if loading}
              <svg class="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
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
              Building...
            {:else}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Build
            {/if}
          </button>
          <span class="text-[9px] text-grey-dark/40 hidden sm:inline">
            {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Enter
          </span>
        </div>

        <!-- Result panel -->
        {#if result}
          <div style="border-top: 1px solid #1e1e42;">
            {#if result.ok}
              <!-- Success -->
              <div class="px-3 py-2 flex items-center gap-2" style="background: #0a200e;">
                <svg class="w-3.5 h-3.5 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-xs text-green-300 font-medium">Valid</span>
                <span class="text-[10px] text-green-400/50">— taxes calculated, envelope built</span>
                <button
                  onclick={() => (showOutput = !showOutput)}
                  class="ml-auto text-[10px] font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  {showOutput ? 'Hide' : 'Show'} envelope
                </button>
              </div>
              {#if showOutput}
                <pre
                  class="p-3 text-[10px] text-paleblue/80 leading-relaxed overflow-auto"
                  style="background: #060618; margin: 0; max-height: 300px;"
                ><code>{result.output}</code></pre>
              {/if}
            {:else}
              <!-- Error -->
              <div class="px-3 py-2.5" style="background: #1a0a0a;">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-3.5 h-3.5 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span class="text-xs text-red-300 font-medium">Validation errors</span>
                </div>
                {#if result.errorFields}
                  <div class="space-y-1 pl-5">
                    {#each formatErrors(result.errorFields) as line}
                      <div class="flex items-start gap-1.5">
                        <span class="text-red-500/40 text-[10px] mt-px shrink-0">›</span>
                        <p class="text-[10px] font-mono text-red-300/80 break-all">{line}</p>
                      </div>
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
  {/if}
</div>
