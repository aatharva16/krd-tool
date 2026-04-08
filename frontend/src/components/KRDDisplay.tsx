import type { GenerateResponse, SectionKey } from '@krd-tool/shared'
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
  response: GenerateResponse
}

export function KRDDisplay({ response }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-gray-900">Generated KRD</h2>
      {SECTION_ORDER.map((key) => (
        <SectionBlock
          key={key}
          title={SECTION_TITLES[key]}
          content={response.sections[key]}
        />
      ))}
    </div>
  )
}
