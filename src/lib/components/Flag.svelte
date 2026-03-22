<script lang="ts">
  let { code, size = 'md' }: { code: string; size?: 'sm' | 'md' | 'lg' } = $props()

  let iso = $derived(code === 'EL' ? 'gr' : code.toLowerCase())

  let sizeClass = $derived(
    size === 'sm'
      ? 'w-4 h-3'
      : size === 'lg'
        ? 'w-7 h-5'
        : 'w-5 h-3.5'
  )
</script>

<span
  class="fi fi-{iso} inline-block rounded-[2px] overflow-hidden shrink-0 {sizeClass}"
  style="line-height: 1; background-size: cover;"
  data-flag-code={iso}
></span>
