import { writable } from 'svelte/store'

export type ViewMode = 'map' | 'table' | 'matrix'
export const viewMode = writable<ViewMode>('map')

// Highlight filters — only one active at a time
export type HighlightMode = 'needs' | 'pending' | null
export const highlightMode = writable<HighlightMode>(null)
