import type { GenerateRequest, GenerateResponse, GenerateSectionRequest } from '@krd-tool/shared'
import { parseSSEStream, type StreamCallbacks } from './streamClient'

const API_BASE = import.meta.env.VITE_API_URL as string

export async function generateKRD(request: GenerateRequest): Promise<GenerateResponse> {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Generation failed (${res.status}): ${body}`)
  }

  return res.json() as Promise<GenerateResponse>
}

export async function generateSection(
  request: GenerateSectionRequest,
  callbacks: StreamCallbacks,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/generate/section`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    callbacks.onError(`Section generation failed (${res.status}): ${body}`)
    return
  }

  await parseSSEStream(res, callbacks)
}
