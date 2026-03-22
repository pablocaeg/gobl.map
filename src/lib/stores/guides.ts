import { writable } from 'svelte/store'
import type { GuideInfo } from '$lib/data/compliance'

export const guidesData = writable<Map<string, GuideInfo>>(new Map())
