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

// Encode a UTF-8 string to base64. Unlike btoa(), this handles
// non-Latin1 characters (accented letters, CJK, etc.).
function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
  return btoa(binary)
}

export async function buildDocument(json: string): Promise<BuildResult> {
  try {
    const payload = {
      data: toBase64(json),
      envelop: true
    }
    const result = await gobl.build({ payload, indent: true })
    return { ok: true, output: result }
  } catch (err) {
    const parsed = gobl.parseGOBLError(err)
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
    const payload = { data: toBase64(json) }
    const result = await gobl.validate({ payload, indent: true })
    return { ok: true, output: result }
  } catch (err) {
    const parsed = gobl.parseGOBLError(err)
    return { ok: false, output: '', error: parsed.message }
  }
}
