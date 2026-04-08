import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { KRDSession } from '@krd-tool/shared'
import { SessionCard } from '../components/SessionCard'
import { getAllSessions, deleteSession } from '../api/sessionsClient'

export function HistoryPage() {
  const [sessions, setSessions] = useState<KRDSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAllSessions()
      .then(setSessions)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load sessions'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    try {
      await deleteSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">KRD History</h1>
        <p className="text-sm text-gray-500 mt-0.5">All past generated KRDs, auto-saved as they stream.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">✕</button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">
          Loading sessions…
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 rounded-lg border-2 border-dashed border-gray-200 text-center">
          <p className="text-sm font-medium text-gray-500">No sessions yet</p>
          <p className="text-xs text-gray-400 mt-1">Generate your first KRD to see it here.</p>
          <Link
            to="/"
            className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 transition-colors"
          >
            Generate a KRD
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={() => handleDelete(session.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
