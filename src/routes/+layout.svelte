<script lang="ts">
  import '../app.css'
  import { onMount } from 'svelte'
  import { regimeData } from '$lib/stores/regimes'
  import { loadRegimes } from '$lib/utils/data-loader'
  import { restoreFromHash } from '$lib/stores/selection'
  import { pendingRegimes } from '$lib/stores/pending'
  import { fetchPendingRegimes } from '$lib/utils/pending-regimes'
  import { base } from '$app/paths'

  let { children } = $props()

  onMount(async () => {
    const data = loadRegimes()
    regimeData.set(data)
    restoreFromHash()

    // Fetch open PRs for in-progress regimes (non-blocking)
    const pending = await fetchPendingRegimes()
    pendingRegimes.set(pending)
  })
</script>

<div
  class="h-screen flex flex-col"
  style="background: linear-gradient(207.28deg, #040421 33.08%, #141432 100%);"
>
  <!-- Navigation matching gobl.org style -->
  <nav class="px-6 md:px-8 flex items-center justify-between shrink-0 z-20 h-16 md:h-20">
    <div class="flex items-center gap-5">
      <a
        href="https://gobl.org"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center"
      >
        <img src="{base}/logo.svg" alt="GOBL" class="h-10 md:h-12 w-auto" />
      </a>
      <div class="hidden sm:flex items-center">
        <span class="text-paleblue text-sm tracking-wide">Tax Regime Map</span>
      </div>
    </div>
    <div class="flex items-center gap-6">
      <a
        href="https://docs.gobl.org"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm text-blue hover:text-paleblue transition-colors tracking-wide"
      >
        Read the Docs&nbsp;→
      </a>
    </div>
  </nav>
  {@render children()}
</div>
