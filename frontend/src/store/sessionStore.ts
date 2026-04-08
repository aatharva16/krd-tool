import { create } from 'zustand'
import type { SectionKey, SessionStatus } from '@krd-tool/shared'

const EMPTY_SECTIONS: Record<SectionKey, string> = {
  overview: '',
  userStories: '',
  requirements: '',
  nfr: '',
  instrumentation: '',
  testing: '',
  openQuestions: '',
  signoff: '',
}

interface SessionStore {
  activeSessionId: string | null
  sections: Record<SectionKey, string>
  sessionStatus: SessionStatus | null
  setActiveSession: (id: string | null) => void
  setSections: (sections: Record<SectionKey, string>) => void
  updateSection: (key: SectionKey, content: string) => void
  setSessionStatus: (status: SessionStatus) => void
  resetSession: () => void
}

// No persist middleware — session state is restored from DB on demand, not localStorage
export const useSessionStore = create<SessionStore>()((set) => ({
  activeSessionId: null,
  sections: EMPTY_SECTIONS,
  sessionStatus: null,

  setActiveSession: (id) => set({ activeSessionId: id }),

  setSections: (sections) => set({ sections }),

  updateSection: (key, content) =>
    set((state) => ({ sections: { ...state.sections, [key]: content } })),

  setSessionStatus: (status) => set({ sessionStatus: status }),

  resetSession: () =>
    set({
      activeSessionId: null,
      sections: { ...EMPTY_SECTIONS },
      sessionStatus: null,
    }),
}))
