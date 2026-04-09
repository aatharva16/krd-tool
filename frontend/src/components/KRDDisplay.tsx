import type { SectionKey } from '@krd-tool/shared'
import { useSessionStore } from '../store/sessionStore'
import { SectionBlock } from './SectionBlock'

const SECTION_TITLES: Record<SectionKey, string> = {
  overview: 'Overview',
  userStories: 'User Stories',
  requirements: 'Functional Requirements',
  nfr: 'Non-Functional Requirements',
  instrumentation: 'Instrumentation & Events',
  testing: 'Testing Checklist',
  openQuestions: 'Open Questions',
  signoff: 'Sign-off',
}

const SECTION_ORDER: SectionKey[] = [
  'overview',
  'userStories',
  'requirements',
  'nfr',
  'instrumentation',
  'testing',
  'openQuestions',
  'signoff',
]

interface Props {
  activeSectionKey: SectionKey | null
  sessionId: string | null
  isFullGenerating: boolean
}

type PillState = 'pending' | 'active' | 'complete'

function getPillState(key: SectionKey, sections: Record<SectionKey, string>, activeSectionKey: SectionKey | null): PillState {
  if (key === activeSectionKey) return 'active'
  if (sections[key].length > 0) return 'complete'
  return 'pending'
}

const PILL_STYLES: Record<PillState, string> = {
  pending: 'bg-gray-100 text-gray-400 border border-gray-200',
  active: 'bg-blue-100 text-blue-700 border border-blue-300 animate-pulse',
  complete: 'bg-green-100 text-green-700 border border-green-300',
}

const PILL_LABELS: Record<SectionKey, string> = {
  overview: 'Overview',
  userStories: 'Stories',
  requirements: 'Requirements',
  nfr: 'NFR',
  instrumentation: 'Events',
  testing: 'Testing',
  openQuestions: 'Questions',
  signoff: 'Sign-off',
}

export function KRDDisplay({ activeSectionKey, sessionId, isFullGenerating }: Props) {
  const { sections, regeneratingSectionKey, isManuallyEdited, isAnyGenerating } = useSessionStore()
  const anyGenerating = isAnyGenerating()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Generated KRD</h2>
      </div>

      {/* Progress indicator */}
      <div className="flex flex-wrap gap-1.5">
        {SECTION_ORDER.map((key) => {
          const isRegenerating = regeneratingSectionKey === key
          const state = isRegenerating ? 'active' : getPillState(key, sections, activeSectionKey)
          return (
            <span
              key={key}
              className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${PILL_STYLES[state]}`}
            >
              {PILL_LABELS[key]}
            </span>
          )
        })}
      </div>

      {/* Section blocks — always rendered so PM can see the overall structure */}
      {SECTION_ORDER.map((key) => (
        <SectionBlock
          key={key}
          title={SECTION_TITLES[key]}
          content={sections[key]}
          isActive={key === activeSectionKey || regeneratingSectionKey === key}
          sectionKey={key}
          sessionId={sessionId}
          isManuallyEdited={isManuallyEdited[key]}
          isAnyGenerating={anyGenerating}
          isFullGenerating={isFullGenerating}
        />
      ))}
    </div>
  )
}
