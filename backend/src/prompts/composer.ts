import type { GenerateRequest, KRDSession, SectionKey } from '@krd-tool/shared'
import { buildSystemPrompt, buildSystemPromptFromSession } from './system'
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

// Builds a regenerate prompt from a stored session (no live GenerateRequest needed)
export function composeSectionRegeneratePrompt(
  session: KRDSession,
  sectionKey: SectionKey,
): { system: string; user: string } {
  const syntheticRequest: GenerateRequest = {
    profileSnapshot: session.profileSnapshot,
    selectedSurfaceIds: session.selectedSurfaces.map((s) => s.id),
    selectedPersonaIds: session.selectedPersonas.map((p) => p.id),
    featureName: session.featureName,
    problemStatement: session.problemStatement,
    proposedSolution: session.proposedSolution,
    v0Scope: session.v0Scope,
    v1Scope: session.v1Scope,
  }
  return {
    system: buildSystemPromptFromSession(session),
    user: sectionBuilders[sectionKey](syntheticRequest),
  }
}

// Builds a refine prompt: includes current content + instruction to revise it
export function composeSectionRefinePrompt(
  session: KRDSession,
  sectionKey: SectionKey,
  currentContent: string,
  refineInstruction: string,
): { system: string; user: string } {
  const syntheticRequest: GenerateRequest = {
    profileSnapshot: session.profileSnapshot,
    selectedSurfaceIds: session.selectedSurfaces.map((s) => s.id),
    selectedPersonaIds: session.selectedPersonas.map((p) => p.id),
    featureName: session.featureName,
    problemStatement: session.problemStatement,
    proposedSolution: session.proposedSolution,
    v0Scope: session.v0Scope,
    v1Scope: session.v1Scope,
  }
  const sectionTemplate = sectionBuilders[sectionKey](syntheticRequest)
  const user = `${sectionTemplate}

The current draft of this section is:
---
${currentContent}
---

Revise the section above according to this instruction:
${refineInstruction}

Rules for revision:
- Preserve all content that the instruction does not ask you to change.
- Do not add a preamble explaining what you changed.
- Do not add a closing summary of the changes made.
- Return only the revised section content in the same format as the original.
- If the instruction asks you to add something, add it. If it asks you to remove something, remove it. If it asks you to change something, change it.
- Do not invent new surfaces, personas, or technical constraints not present in the context above.`

  return {
    system: buildSystemPromptFromSession(session),
    user,
  }
}
