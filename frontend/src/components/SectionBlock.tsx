import { useState, useRef, useEffect, useCallback } from 'react'
import type { SectionKey } from '@krd-tool/shared'
import { upsertSection } from '../api/sessionsClient'
import { useSessionStore } from '../store/sessionStore'
import { useSectionGeneration } from '../hooks/useSectionGeneration'
import { RefineInput } from './RefineInput'
import { ConfirmDialog } from './ConfirmDialog'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  title: string
  content: string
  isActive: boolean
  sectionKey: SectionKey
  sessionId: string | null
  isManuallyEdited: boolean
  isAnyGenerating: boolean
  isFullGenerating: boolean
}

export function SectionBlock({
  title,
  content,
  isActive,
  sectionKey,
  sessionId,
  isManuallyEdited,
  isAnyGenerating,
  isFullGenerating,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [localContent, setLocalContent] = useState(content)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false)

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { updateSection, setManuallyEdited } = useSessionStore()
  const { regenerateSection, refineSection } = useSectionGeneration()

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    }
  }, [])

  const handleContentChange = useCallback(
    (newContent: string) => {
      setLocalContent(newContent)
      setSaveStatus('saving')

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

      saveTimerRef.current = setTimeout(async () => {
        if (!sessionId) return
        if (newContent === content) {
          setSaveStatus('idle')
          return
        }
        try {
          await upsertSection(sessionId, sectionKey, newContent, true)
          updateSection(sectionKey, newContent)
          setManuallyEdited(sectionKey, true)
          setSaveStatus('saved')
          setSaveError(null)
          // Auto-hide "Saved" after 3s
          savedTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 3000)
        } catch {
          setSaveStatus('error')
          setSaveError('Auto-save failed — check connection')
        }
      }, 1500)
    },
    [sessionId, sectionKey, content, updateSection, setManuallyEdited],
  )

  function handleContentClick() {
    if (!isActive && !isAnyGenerating && !isFullGenerating && sessionId) {
      setIsEditing(true)
      setLocalContent(content)
    }
  }

  function handleRegenerate() {
    if (isAnyGenerating || isFullGenerating) return
    if (isManuallyEdited) {
      setShowConfirmRegenerate(true)
    } else {
      void regenerateSection(sectionKey)
    }
  }

  function handleConfirmRegenerate() {
    setShowConfirmRegenerate(false)
    setIsEditing(false)
    void regenerateSection(sectionKey)
  }

  function handleRefine(instruction: string) {
    setIsEditing(false)
    void refineSection(sectionKey, instruction)
  }

  function handleCopy() {
    const textToCopy = isEditing ? localContent : content
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const hasContent = content.length > 0
  const showCopy = !isActive && hasContent && !isEditing
  const showPlaceholder = !isActive && !hasContent
  const actionsDisabled = isAnyGenerating || isFullGenerating

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-gray-600 text-left"
          >
            <span className="text-gray-400 text-xs">{collapsed ? '▶' : '▼'}</span>
            {title}
          </button>
          {isManuallyEdited && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium whitespace-nowrap">
              Manually edited
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Save status indicator */}
          {saveStatus === 'saving' && (
            <span className="text-xs text-gray-400">Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-gray-400">Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-amber-600">{saveError}</span>
          )}
          {showCopy && (
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <>
          {isEditing ? (
            <textarea
              value={localContent}
              onChange={(e) => handleContentChange(e.target.value)}
              autoFocus
              className="w-full p-4 text-sm text-gray-700 font-mono leading-relaxed resize-y min-h-[200px] border-0 outline-none focus:ring-1 focus:ring-blue-200"
              spellCheck={false}
            />
          ) : (
            <pre
              className={`p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto ${
                !isActive && hasContent && sessionId && !isAnyGenerating && !isFullGenerating
                  ? 'cursor-text hover:bg-gray-50 transition-colors'
                  : ''
              }`}
              onClick={handleContentClick}
              title={!isActive && hasContent && sessionId ? 'Click to edit' : undefined}
            >
              {showPlaceholder ? (
                <span className="text-gray-400 italic">Waiting…</span>
              ) : (
                <>
                  {content}
                  {isActive && <span className="cursor-blink ml-0.5">|</span>}
                </>
              )}
            </pre>
          )}

          {/* Refinement toolbar — only shown when session exists and section has content */}
          {hasContent && !isActive && sessionId && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 space-y-2">
              {/* Confirm dialog for regenerate-over-manual-edit */}
              {showConfirmRegenerate && (
                <ConfirmDialog
                  message="This section has been manually edited. Regenerating will replace your edits with AI-generated content."
                  confirmLabel="Regenerate anyway"
                  cancelLabel="Keep my edits"
                  onConfirm={handleConfirmRegenerate}
                  onCancel={() => setShowConfirmRegenerate(false)}
                />
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerate}
                  disabled={actionsDisabled}
                  className="text-xs px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Regenerate
                </button>
                {actionsDisabled && (
                  <span className="text-xs text-gray-400 italic">Generation in progress…</span>
                )}
              </div>

              <RefineInput onRefine={handleRefine} isDisabled={actionsDisabled} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
