import { writable } from 'svelte/store'
import type { PendingRegime } from '$lib/utils/pending-regimes'

export const pendingRegimes = writable<PendingRegime[]>([])
