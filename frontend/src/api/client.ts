import type { GenerateRequest, GenerateResponse } from '@krd-tool/shared'

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
