import type { ExportRequest } from '@krd-tool/shared'

const API_BASE = import.meta.env.VITE_API_URL as string

export async function exportKRD(sessionId: string, featureName: string): Promise<void> {
  const body: ExportRequest = { sessionId }

  const res = await fetch(`${API_BASE}/api/export/docx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Export failed (${res.status}): ${text}`)
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const safeName = featureName.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
  const a = document.createElement('a')
  a.href = url
  a.download = `${safeName}-KRD.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
