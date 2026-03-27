import { writable } from 'svelte/store'
import * as gobl from '@invopop/gobl-worker'

export const workerReady = writable(false)

// Initialize the worker. It downloads the WASM binary from CDN on first use.
export async function initWorker() {
  try {
    await gobl.ping()
    workerReady.set(true)
  } catch (err) {
    console.error('Failed to initialize GOBL worker:', err)
  }
}

export interface BuildResult {
  ok: boolean
  output: string
  error?: string
  errorFields?: Record<string, unknown>
}

export async function buildDocument(json: string): Promise<BuildResult> {
  try {
    const payload = {
      data: btoa(json),
      envelop: true
    }
    const result = await gobl.build({ payload, indent: true })
    return { ok: true, output: result }
  } catch (err) {
    const parsed = gobl.parseGOBLError(err)
    // Try to parse structured validation errors from the message.
    let errorFields: Record<string, unknown> | undefined
    try {
      const obj = JSON.parse(parsed.message)
      if (obj.fields) {
        errorFields = obj.fields
      }
    } catch {
      // Not JSON — plain error message.
    }
    return {
      ok: false,
      output: '',
      error: parsed.message,
      errorFields
    }
  }
}

export async function validateDocument(json: string): Promise<BuildResult> {
  try {
    const payload = { data: btoa(json) }
    const result = await gobl.validate({ payload, indent: true })
    return { ok: true, output: result }
  } catch (err) {
    const parsed = gobl.parseGOBLError(err)
    return { ok: false, output: '', error: parsed.message }
  }
}
