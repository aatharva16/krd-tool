import { useState, useEffect } from 'react'
import type { Profile, CreateProfileRequest, UpdateProfileRequest } from '@krd-tool/shared'
import { ProfileCard } from '../components/ProfileCard'
import { ProfileForm } from '../components/ProfileForm'
import { useProfileStore } from '../store/profileStore'
import {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  duplicateProfile,
} from '../api/profilesClient'

type ModalState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; profile: Profile }

export function ProfilesPage() {
  const [profiles, setProfilesList] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [formLoading, setFormLoading] = useState(false)

  const { setProfiles, activeProfileId, setActiveProfile } = useProfileStore()

  async function fetchProfiles() {
    try {
      const data = await getProfiles()
      setProfilesList(data)
      setProfiles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProfiles() }, [])

  async function handleCreate(data: CreateProfileRequest) {
    setFormLoading(true)
    try {
      const created = await createProfile(data)
      const updated = [created, ...profiles]
      setProfilesList(updated)
      setProfiles(updated)
      setModal({ mode: 'closed' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleEdit(id: string, data: UpdateProfileRequest) {
    setFormLoading(true)
    try {
      const updated = await updateProfile(id, data)
      const updatedList = profiles.map((p) => (p.id === id ? updated : p))
      setProfilesList(updatedList)
      setProfiles(updatedList)
      setModal({ mode: 'closed' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProfile(id)
      const updatedList = profiles.filter((p) => p.id !== id)
      setProfilesList(updatedList)
      setProfiles(updatedList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile')
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const copy = await duplicateProfile(id)
      const updatedList = [copy, ...profiles]
      setProfilesList(updatedList)
      setProfiles(updatedList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate profile')
    }
  }

  async function handleSelect(id: string) {
    setActiveProfile(id)
    try {
      const updated = await updateProfile(id, { lastUsedAt: new Date().toISOString() })
      const updatedList = profiles.map((p) => (p.id === id ? updated : p))
      setProfilesList(updatedList)
      setProfiles(updatedList)
    } catch {
      // Non-critical — selection is already recorded in the Zustand store
    }
  }

  function handleFormSubmit(data: CreateProfileRequest) {
    if (modal.mode === 'create') {
      handleCreate(data)
    } else if (modal.mode === 'edit') {
      handleEdit(modal.profile.id, data)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Team Profiles</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Save your domain context once, reuse it across every KRD session.
            </p>
          </div>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 transition-colors"
          >
            Create new profile
          </button>
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
            Loading profiles…
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-lg border-2 border-dashed border-gray-200 text-center">
            <p className="text-sm font-medium text-gray-500">No profiles yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first profile to get started.</p>
            <button
              onClick={() => setModal({ mode: 'create' })}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 transition-colors"
            >
              Create profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isActive={profile.id === activeProfileId}
                onEdit={() => setModal({ mode: 'edit', profile })}
                onDuplicate={() => handleDuplicate(profile.id)}
                onDelete={() => handleDelete(profile.id)}
                onSelect={() => handleSelect(profile.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal overlay */}
      {modal.mode !== 'closed' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              {modal.mode === 'create' ? 'Create new profile' : `Edit — ${modal.profile.name}`}
            </h2>
            <ProfileForm
              initialValues={modal.mode === 'edit' ? modal.profile : null}
              onSubmit={handleFormSubmit}
              onCancel={() => setModal({ mode: 'closed' })}
              isLoading={formLoading}
            />
          </div>
        </div>
      )}
    </div>
  )
}
