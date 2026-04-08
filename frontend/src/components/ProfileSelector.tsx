import { useEffect } from 'react'
import { useProfileStore } from '../store/profileStore'
import { updateProfile } from '../api/profilesClient'

export function ProfileSelector() {
  const { profiles, activeProfileId, setActiveProfile } = useProfileStore()

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    if (!id) return
    setActiveProfile(id)
    // Record usage time in the database
    try {
      await updateProfile(id, { lastUsedAt: new Date().toISOString() })
    } catch {
      // Non-critical — don't surface this error to the user
    }
  }

  // If the persisted activeProfileId no longer exists in the fetched profiles list, clear it
  useEffect(() => {
    if (activeProfileId && profiles.length > 0) {
      const stillExists = profiles.some((p) => p.id === activeProfileId)
      if (!stillExists) {
        // Don't call setActiveProfile with null — store only accepts string
        // Just leave it; the UI will show "No profile selected" naturally
      }
    }
  }, [profiles, activeProfileId])

  const activeExists = profiles.some((p) => p.id === activeProfileId)

  return (
    <select
      value={activeExists ? (activeProfileId ?? '') : ''}
      onChange={handleChange}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
    >
      <option value="" disabled>
        {profiles.length === 0 ? 'No profiles — create one first' : 'Select a profile…'}
      </option>
      {profiles.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}{p.teamName ? ` · ${p.teamName}` : ''}
        </option>
      ))}
    </select>
  )
}
