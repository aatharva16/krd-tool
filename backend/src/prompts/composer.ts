import type { GenerateRequest, SectionKey } from '@krd-tool/shared'
import { buildSystemPrompt } from './system'
import { buildOverviewPrompt } from './sections/overview'
import { buildUserStoriesPrompt } from './sections/userStories'
import { buildRequirementsPrompt } from './sections/requirements'
import { buildNfrPrompt } from './sections/nfr'
import { buildInstrumentationPrompt } from './sections/instrumentation'
import { buildTestingPrompt } from './sections/testing'
import { buildOpenQuestionsPrompt } from './sections/openQuestions'
import { buildSignoffPrompt } from './sections/signoff'

const sectionBuilders: Record<SectionKey, (req: GenerateRequest) => string> = {
  overview: buildOverviewPrompt,
  userStories: buildUserStoriesPrompt,
  requirements: buildRequirementsPrompt,
  nfr: buildNfrPrompt,
  instrumentation: buildInstrumentationPrompt,
  testing: buildTestingPrompt,
  openQuestions: buildOpenQuestionsPrompt,
  signoff: buildSignoffPrompt,
}

export function composePrompt(
  request: GenerateRequest,
  sectionKey: SectionKey,
): { system: string; user: string } {
  return {
    system: buildSystemPrompt(request),
    user: sectionBuilders[sectionKey](request),
  }
}
