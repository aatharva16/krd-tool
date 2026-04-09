import type { GenerateRequest } from '@krd-tool/shared'

export function buildOpenQuestionsPrompt(request: GenerateRequest): string {
  const selectedPersonas = request.profileSnapshot.personas.filter((p) =>
    request.selectedPersonaIds.includes(p.id),
  )
  const personasList = selectedPersonas.map((p) => `  - ${p.name}`).join('\n')

  return `Write the Open Questions section of a Key Requirements Document for the feature described below.

Feature Name: ${request.featureName}
Problem Statement: ${request.problemStatement}
Proposed Solution: ${request.proposedSolution}
V0 Scope: ${request.v0Scope}
V1 Scope: ${request.v1Scope || 'Not specified.'}
Technical Constraints: ${request.profileSnapshot.techConstraints || 'None specified.'}

Personas:
${personasList}

Output a table with these exact columns:

| # | Question | Owner | Deadline | Status |

Rules:
- Generate at least 3 questions, seeded from gaps, ambiguities, or implied decisions in the provided context
- Look for: decisions that are implied but not stated, surface interactions that are unclear, technical constraints that may affect the feature, edge cases that have no specified behaviour, and success metrics that require alignment
- Owner must be a role name (e.g. "Product", "Tech Lead", "Design", or one of the persona roles) — not a person's name
- Leave the Deadline column blank (it will be filled by the team)
- Status for all rows: Open
- Questions must be specific to this feature — do not generate generic questions about the product

Do not include a preamble, closing summary, or any text outside the section content itself.`
}
