import type { Profile, CreateProfileRequest, UpdateProfileRequest } from '@krd-tool/shared'

const API_BASE = import.meta.env.VITE_API_URL as string

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}): ${body}`)
  }
  return res.json() as Promise<T>
}

export async function getProfiles(): Promise<Profile[]> {
  const res = await fetch(`${API_BASE}/api/profiles`)
  return handleResponse<Profile[]>(res)
}

export async function createProfile(data: CreateProfileRequest): Promise<Profile> {
  const res = await fetch(`${API_BASE}/api/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<Profile>(res)
}

export async function updateProfile(id: string, data: UpdateProfileRequest): Promise<Profile> {
  const res = await fetch(`${API_BASE}/api/profiles/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<Profile>(res)
}

export async function deleteProfile(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/profiles/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Delete failed (${res.status}): ${body}`)
  }
}

export async function duplicateProfile(id: string): Promise<Profile> {
  const res = await fetch(`${API_BASE}/api/profiles/${id}/duplicate`, { method: 'POST' })
  return handleResponse<Profile>(res)
}
