import { useState } from 'react'
import type { Profile } from '@krd-tool/shared'

interface Props {
  profile: Profile
  isActive: boolean
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onSelect: () => void
}

function formatLastUsed(lastUsedAt: string | null): string {
  if (!lastUsedAt) return 'Never used'
  const diff = Date.now() - new Date(lastUsedAt).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Used today'
  if (days === 1) return 'Used yesterday'
  return `Used ${days} days ago`
}

export function ProfileCard({ profile, isActive, onEdit, onDuplicate, onDelete, onSelect }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleDeleteClick() {
    if (confirmDelete) {
      onDelete()
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
    }
  }

  return (
    <div
      className={`rounded-lg border p-4 flex flex-col gap-3 transition-colors ${
        isActive
          ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 text-sm">{profile.name}</p>
            {isActive && (
              <span className="text-xs font-medium text-white bg-gray-900 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>
          {profile.teamName && (
            <p className="text-xs text-gray-500 mt-0.5">{profile.teamName}</p>
          )}
        </div>
        <p className="text-xs text-gray-400 shrink-0">{formatLastUsed(profile.lastUsedAt)}</p>
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-xs text-gray-500">
        <span>{profile.surfaces.length} surface{profile.surfaces.length !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{profile.personas.length} persona{profile.personas.length !== 1 ? 's' : ''}</span>
        {profile.glossary.length > 0 && (
          <>
            <span>·</span>
            <span>{profile.glossary.length} term{profile.glossary.length !== 1 ? 's' : ''}</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        {!isActive && (
          <button
            onClick={onSelect}
            className="text-xs font-medium text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Select
          </button>
        )}
        <button
          onClick={onEdit}
          className="text-xs font-medium text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDuplicate}
          className="text-xs font-medium text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          Duplicate
        </button>
        <button
          onClick={handleDeleteClick}
          onBlur={() => setConfirmDelete(false)}
          className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
            confirmDelete
              ? 'text-red-700 bg-red-50 hover:bg-red-100'
              : 'text-red-600 hover:text-red-800 hover:bg-red-50'
          }`}
        >
          {confirmDelete ? 'Confirm delete' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
