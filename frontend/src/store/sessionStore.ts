import { create } from 'zustand'
import { SECTION_KEYS } from '@krd-tool/shared'
import type { KRDSection, SectionKey, SessionStatus } from '@krd-tool/shared'

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

const EMPTY_MANUALLY_EDITED: Record<SectionKey, boolean> = {
  overview: false,
  userStories: false,
  requirements: false,
  nfr: false,
  instrumentation: false,
  testing: false,
  openQuestions: false,
  signoff: false,
}

interface SessionStore {
  activeSessionId: string | null
  sections: Record<SectionKey, string>
  sessionStatus: SessionStatus | null
  // Phase 4: tracks which section is currently being (re)generated. '__full__' = full generation in progress.
  regeneratingSectionKey: SectionKey | '__full__' | null
  // Phase 4: tracks which sections have been manually edited (shown with badge)
  isManuallyEdited: Record<SectionKey, boolean>

  setActiveSession: (id: string | null) => void
  setSections: (sections: Record<SectionKey, string>) => void
  updateSection: (key: SectionKey, content: string) => void
  setSessionStatus: (status: SessionStatus) => void
  resetSession: () => void
  // Phase 4 actions
  setRegeneratingSectionKey: (key: SectionKey | '__full__' | null) => void
  setManuallyEdited: (key: SectionKey, value: boolean) => void
  resetManuallyEdited: () => void
  loadSectionMetadata: (sections: KRDSection[]) => void
  isAnyGenerating: () => boolean
}

// No persist middleware — session state is restored from DB on demand, not localStorage
export const useSessionStore = create<SessionStore>()((set, get) => ({
  activeSessionId: null,
  sections: EMPTY_SECTIONS,
  sessionStatus: null,
  regeneratingSectionKey: null,
  isManuallyEdited: { ...EMPTY_MANUALLY_EDITED },

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
      regeneratingSectionKey: null,
      isManuallyEdited: { ...EMPTY_MANUALLY_EDITED },
    }),

  setRegeneratingSectionKey: (key) => set({ regeneratingSectionKey: key }),

  setManuallyEdited: (key, value) =>
    set((state) => ({
      isManuallyEdited: { ...state.isManuallyEdited, [key]: value },
    })),

  resetManuallyEdited: () => set({ isManuallyEdited: { ...EMPTY_MANUALLY_EDITED } }),

  // Called after loading a session from DB to populate isManuallyEdited from stored section rows
  loadSectionMetadata: (sections: KRDSection[]) => {
    const manuallyEdited = { ...EMPTY_MANUALLY_EDITED }
    const content = { ...EMPTY_SECTIONS }
    for (const sec of sections) {
      if ((SECTION_KEYS as readonly string[]).includes(sec.sectionKey)) {
        manuallyEdited[sec.sectionKey] = sec.isManuallyEdited
        if (sec.content) content[sec.sectionKey] = sec.content
      }
    }
    set({ isManuallyEdited: manuallyEdited, sections: content })
  },

  isAnyGenerating: () => get().regeneratingSectionKey !== null,
}))
