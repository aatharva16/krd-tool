import { useState, useCallback, useEffect } from 'react'
import type { GenerateRequest, SectionKey } from '@krd-tool/shared'
import { streamGenerateKRD } from '../api/streamClient'
import { generateKRD } from '../api/client'
import { getSessionWithSections } from '../api/sessionsClient'

const SECTION_KEYS: SectionKey[] = [
  'overview',
  'userStories',
  'requirements',
  'nfr',
  'instrumentation',
  'testing',
  'openQuestions',
  'signoff',
]

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

export interface KRDGenerationState {
  sections: Record<SectionKey, string>
  activeSectionKey: SectionKey | null
  isGenerating: boolean
  error: string | null
  progress: number
  sessionId: string | null
  generate: (request: GenerateRequest) => Promise<void>
  reset: () => void
}

export function useKRDGeneration(initialSessionId?: string): KRDGenerationState {
  const [sections, setSections] = useState<Record<SectionKey, string>>(EMPTY_SECTIONS)
  const [activeSectionKey, setActiveSectionKey] = useState<SectionKey | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null)

  // Restore sections from DB when a session ID is provided (e.g. navigating to /generate/:id)
  useEffect(() => {
    if (!initialSessionId) return
    getSessionWithSections(initialSessionId)
      .then((session) => {
        if (!session) return
        const restored: Record<SectionKey, string> = { ...EMPTY_SECTIONS }
        for (const sec of session.sections ?? []) {
          if (sec.content) restored[sec.sectionKey] = sec.content
        }
        setSections(restored)
        setProgress(Object.values(restored).filter(Boolean).length)
        setSessionId(initialSessionId)
      })
      .catch((err) => {
        console.warn('[useKRDGeneration] Failed to restore session:', err)
      })
  }, [initialSessionId])

  const reset = useCallback(() => {
    setSections(EMPTY_SECTIONS)
    setActiveSectionKey(null)
    setIsGenerating(false)
    setError(null)
    setProgress(0)
    setSessionId(null)
  }, [])

  const generate = useCallback(async (request: GenerateRequest) => {
    setIsGenerating(true)
    setError(null)
    setSections(EMPTY_SECTIONS)
    setProgress(0)
    setActiveSectionKey(null)

    // Track the session ID for this generation run
    if (request.sessionId) {
      setSessionId(request.sessionId)
    }

    let hasReceivedFirstEvent = false

    try {
      await streamGenerateKRD(request, {
        onSectionStart: (sectionKey) => {
          hasReceivedFirstEvent = true
          setActiveSectionKey(sectionKey)
        },
        onToken: (sectionKey, delta) => {
          setSections((prev) => ({
            ...prev,
            [sectionKey]: prev[sectionKey] + delta,
          }))
        },
        onSectionEnd: () => {
          setProgress((p) => p + 1)
          setActiveSectionKey(null)
          // Section save is handled server-side in generateStream.ts (fire-and-forget)
          // No client-side upsert here to avoid double-writing
        },
        onDone: () => {
          setIsGenerating(false)
        },
        onError: (message) => {
          setError(message)
          setIsGenerating(false)
        },
      })
    } catch (err) {
      // T-07: If streaming failed before any event arrived, fall back to the
      // non-streaming endpoint so the PM still gets their KRD.
      if (!hasReceivedFirstEvent) {
        try {
          const response = await generateKRD(request)
          setSections(response.sections)
          setProgress(SECTION_KEYS.length)
          setIsGenerating(false)
        } catch (fallbackErr) {
          const message =
            fallbackErr instanceof Error ? fallbackErr.message : 'Generation failed. Please try again.'
          setError(message)
        }
      } else {
        const message = err instanceof Error ? err.message : 'Generation failed. Please try again.'
        setError(message)
      }
    } finally {
      // Guarantee isGenerating resets even if done event was never received
      setIsGenerating(false)
    }
  }, [])

  return {
    sections,
    activeSectionKey,
    isGenerating,
    error,
    progress,
    sessionId,
    generate,
    reset,
  }
}
