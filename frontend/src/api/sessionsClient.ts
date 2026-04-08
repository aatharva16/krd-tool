import type {
  KRDSession,
  KRDSection,
  CreateSessionRequest,
  UpdateSessionRequest,
  SectionKey,
} from '@krd-tool/shared'

const API_BASE = import.meta.env.VITE_API_URL as string

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}): ${body}`)
  }
  return res.json() as Promise<T>
}

export async function getAllSessions(): Promise<KRDSession[]> {
  const res = await fetch(`${API_BASE}/api/sessions`)
  return handleResponse<KRDSession[]>(res)
}

export async function createSession(data: CreateSessionRequest): Promise<KRDSession> {
  const res = await fetch(`${API_BASE}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<KRDSession>(res)
}

export async function getSessionWithSections(id: string): Promise<KRDSession | null> {
  const res = await fetch(`${API_BASE}/api/sessions/${id}`)
  if (res.status === 404) return null
  return handleResponse<KRDSession>(res)
}

export async function updateSession(id: string, data: UpdateSessionRequest): Promise<KRDSession> {
  const res = await fetch(`${API_BASE}/api/sessions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<KRDSession>(res)
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/sessions/${id}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 404) {
    const body = await res.text().catch(() => '')
    throw new Error(`Delete failed (${res.status}): ${body}`)
  }
}

export async function upsertSection(
  sessionId: string,
  sectionKey: SectionKey,
  content: string,
): Promise<KRDSection> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/sections/${sectionKey}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  return handleResponse<KRDSection>(res)
}
