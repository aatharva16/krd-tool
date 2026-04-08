import type { GenerateRequest, SectionKey } from '@krd-tool/shared'

const API_BASE = import.meta.env.VITE_API_URL as string

export interface StreamCallbacks {
  onSectionStart: (sectionKey: SectionKey) => void
  onToken: (sectionKey: SectionKey, delta: string) => void
  onSectionEnd: (sectionKey: SectionKey) => void
  onDone: () => void
  onError: (message: string) => void
}

type SSEPayload =
  | { type: 'section_start'; sectionKey: SectionKey }
  | { type: 'token'; sectionKey: SectionKey; delta: string }
  | { type: 'section_end'; sectionKey: SectionKey }
  | { type: 'done' }
  | { type: 'error'; message: string }

function routeEvent(payload: SSEPayload, callbacks: StreamCallbacks): void {
  switch (payload.type) {
    case 'section_start':
      callbacks.onSectionStart(payload.sectionKey)
      break
    case 'token':
      callbacks.onToken(payload.sectionKey, payload.delta)
      break
    case 'section_end':
      callbacks.onSectionEnd(payload.sectionKey)
      break
    case 'done':
      callbacks.onDone()
      break
    case 'error':
      callbacks.onError(payload.message)
      break
  }
}

export async function streamGenerateKRD(
  request: GenerateRequest,
  callbacks: StreamCallbacks,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/generate/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    callbacks.onError(`Stream request failed (${res.status}): ${body}`)
    return
  }

  if (!res.body) {
    callbacks.onError('No response body received from stream endpoint')
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Split on double-newline to extract complete SSE events.
    // The last element may be an incomplete event — keep it in the buffer.
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const event of events) {
      if (!event.startsWith('data: ')) continue
      const jsonStr = event.slice('data: '.length).trim()
      if (!jsonStr) continue
      try {
        const payload = JSON.parse(jsonStr) as SSEPayload
        routeEvent(payload, callbacks)
      } catch {
        console.warn('[streamClient] Failed to parse SSE event:', jsonStr)
      }
    }
  }
}
