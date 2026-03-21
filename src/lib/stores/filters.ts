import { writable } from 'svelte/store'
import type { Region } from '$lib/data/regions'

export const searchQuery = writable('')
export const activeRegion = writable<Region | null>(null)
export type ViewMode = 'map' | 'table' | 'matrix'
export const viewMode = writable<ViewMode>('map')
