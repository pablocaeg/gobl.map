import { writable } from 'svelte/store'

// Pre-fetched world topology JSON, loaded once in layout
export const topologyData = writable<any>(null)
