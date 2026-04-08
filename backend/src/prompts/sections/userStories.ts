import type { GenerateRequest } from '@krd-tool/shared'

export function buildUserStoriesPrompt(request: GenerateRequest): string {
  const personasList = request.personas.map((p, i) => `  ${i + 1}. ${p}`).join('\n')

  return `Write the User Stories section of a Key Requirements Document for the feature described below.

Feature Name: ${request.featureName}
Problem Statement: ${request.problemStatement}
Proposed Solution: ${request.proposedSolution}
V0 Scope: ${request.v0Scope}

Personas (write exactly one story per persona — no more, no fewer):
${personasList}

For each persona, write one user story using this exact format:

---
ID: US-001
Persona: [exact persona name from the list above]
Story: As a [persona], I want to [goal], so that [outcome].
Acceptance Criteria:
  - [specific, observable, testable behaviour — not a vague outcome]
  - [specific, observable, testable behaviour]
  - [specific, observable, testable behaviour]
  (3–5 criteria per story)
Edge Cases:
  - [failure mode, boundary condition, or exceptional path — distinct from acceptance criteria]
  - [failure mode, boundary condition, or exceptional path]
  (2–3 edge cases per story)
---

Rules:
- Number stories sequentially: US-001, US-002, US-003, etc.
- Use the exact persona name from the list above — do not paraphrase
- Acceptance criteria must describe specific, observable behaviour (e.g. "The system displays a confirmation toast" not "The user is notified")
- Edge cases must be distinct from acceptance criteria — they describe what happens when things go wrong or hit boundaries
- Reference the surfaces listed in the context where relevant

Do not include a preamble, closing summary, or any text outside the section content itself.`
}
