import { useCallback } from 'react'
import type { SectionKey } from '@krd-tool/shared'
import { generateSection } from '../api/client'
import { useSessionStore } from '../store/sessionStore'

export function useSectionGeneration() {
  const {
    activeSessionId,
    regeneratingSectionKey,
    updateSection,
    setManuallyEdited,
    setRegeneratingSectionKey,
    isAnyGenerating,
  } = useSessionStore()

  const regenerateSection = useCallback(
    async (sectionKey: SectionKey): Promise<void> => {
      if (isAnyGenerating()) {
        console.warn('[useSectionGeneration] Generation already in progress — ignoring regenerate request')
        return
      }
      if (!activeSessionId) {
        console.warn('[useSectionGeneration] No active session — cannot regenerate section')
        return
      }

      setRegeneratingSectionKey(sectionKey)
      // Clear the section content so streaming fills it fresh
      updateSection(sectionKey, '')

      try {
        let accumulated = ''
        await generateSection(
          { sessionId: activeSessionId, sectionKey },
          {
            onSectionStart: () => {
              accumulated = ''
            },
            onToken: (_key, delta) => {
              accumulated += delta
              updateSection(sectionKey, accumulated)
            },
            onSectionEnd: () => {
              // Backend saves to DB — nothing to do client-side here
            },
            onDone: () => {
              setManuallyEdited(sectionKey, false)
            },
            onError: (message) => {
              console.error(`[useSectionGeneration] Error regenerating ${sectionKey}:`, message)
            },
          },
        )
      } finally {
        setRegeneratingSectionKey(null)
      }
    },
    [activeSessionId, isAnyGenerating, updateSection, setManuallyEdited, setRegeneratingSectionKey],
  )

  const refineSection = useCallback(
    async (sectionKey: SectionKey, instruction: string): Promise<void> => {
      if (!instruction || instruction.trim().length < 5) {
        console.warn('[useSectionGeneration] Refine instruction too short — ignoring')
        return
      }
      if (isAnyGenerating()) {
        console.warn('[useSectionGeneration] Generation already in progress — ignoring refine request')
        return
      }
      if (!activeSessionId) {
        console.warn('[useSectionGeneration] No active session — cannot refine section')
        return
      }

      setRegeneratingSectionKey(sectionKey)
      // Clear section content so streaming fills it fresh
      updateSection(sectionKey, '')

      try {
        let accumulated = ''
        await generateSection(
          { sessionId: activeSessionId, sectionKey, refineInstruction: instruction.trim() },
          {
            onSectionStart: () => {
              accumulated = ''
            },
            onToken: (_key, delta) => {
              accumulated += delta
              updateSection(sectionKey, accumulated)
            },
            onSectionEnd: () => {
              // Backend saves to DB
            },
            onDone: () => {
              setManuallyEdited(sectionKey, false)
            },
            onError: (message) => {
              console.error(`[useSectionGeneration] Error refining ${sectionKey}:`, message)
            },
          },
        )
      } finally {
        setRegeneratingSectionKey(null)
      }
    },
    [activeSessionId, isAnyGenerating, updateSection, setManuallyEdited, setRegeneratingSectionKey],
  )

  return { regenerateSection, refineSection, regeneratingSectionKey }
}
