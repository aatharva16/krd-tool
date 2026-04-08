import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { KRDSession, SessionStatus } from '@krd-tool/shared'

interface Props {
  session: KRDSession
  onDelete: () => void
}

function formatDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function StatusBadge({ status }: { status: SessionStatus }) {
  if (status === 'complete') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-300">
        Complete
      </span>
    )
  }
  if (status === 'generating') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300 animate-pulse">
        Generating…
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
      Draft
    </span>
  )
}

export function SessionCard({ session, onDelete }: Props) {
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleCardClick() {
    navigate(`/generate/${session.id}`)
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete()
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
    }
  }

  function handleDeleteBlur() {
    setConfirmDelete(false)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-3 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{session.featureName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{session.profileSnapshot.name}</p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <StatusBadge status={session.status} />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{formatDate(session.updatedAt)}</p>

        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          onBlur={handleDeleteBlur}
          className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
            confirmDelete
              ? 'text-red-700 bg-red-50 hover:bg-red-100'
              : 'text-red-500 hover:text-red-700 hover:bg-red-50'
          }`}
        >
          {confirmDelete ? 'Confirm delete' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
