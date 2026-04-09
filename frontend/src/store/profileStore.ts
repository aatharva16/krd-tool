import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '@krd-tool/shared'

interface ProfileStore {
  profiles: Profile[]
  activeProfileId: string | null
  setProfiles: (profiles: Profile[]) => void
  setActiveProfile: (id: string) => void
  getActiveProfile: () => Profile | null
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,

      setProfiles: (profiles) => set({ profiles }),

      setActiveProfile: (id) => set({ activeProfileId: id }),

      getActiveProfile: () => {
        const { profiles, activeProfileId } = get()
        return profiles.find((p) => p.id === activeProfileId) ?? null
      },
    }),
    {
      name: 'krd-tool-profile-store',
      // Only persist the active profile ID — profiles list is always fetched fresh from API
      partialize: (state) => ({ activeProfileId: state.activeProfileId }),
    },
  ),
)
