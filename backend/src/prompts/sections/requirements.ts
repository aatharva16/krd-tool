import type { GenerateRequest } from '@krd-tool/shared'

export function buildRequirementsPrompt(request: GenerateRequest): string {
  const selectedSurfaces = request.profileSnapshot.surfaces.filter((s) =>
    request.selectedSurfaceIds.includes(s.id),
  )
  const surfacesList = selectedSurfaces.map((s) => `  - ${s.name}`).join('\n')

  return `Write the Functional Requirements section of a Key Requirements Document for the feature described below.

Feature Name: ${request.featureName}
Problem Statement: ${request.problemStatement}
Proposed Solution: ${request.proposedSolution}
V0 Scope: ${request.v0Scope}
V1 Scope: ${request.v1Scope || 'Not specified.'}

Surfaces (create one sub-section per surface — requirements must be grouped by surface):
${surfacesList}

Output format:
Create one sub-section per surface using a heading like "### [Surface Name]".
Under each surface, produce a requirements table with these exact columns:

| ID | Requirement | Priority | Acceptance Criteria |

Rules:
- ID format: REQ-001, REQ-002, etc. (sequential across all surfaces, not restarting per surface)
- Priority must be exactly one of: Must / Should / Could — no other values permitted
- Every requirement row must have a non-empty Acceptance Criteria column — describe what "done" looks like in observable terms
- Requirements must be specific to this feature — do not write generic system requirements
- Reference personas by their exact names where relevant to clarify who the requirement serves
- Include requirements for both V0 and V1 scope — mark V1 requirements as "Should" or "Could" priority

Do not include a preamble, closing summary, or any text outside the section content itself.`
}
