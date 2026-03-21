import { writable } from 'svelte/store'
import type { CountryData } from '$lib/utils/data-loader'

export const regimeData = writable<Map<string, CountryData>>(new Map())
