import type { GenerateRequest } from '@krd-tool/shared'

export function buildInstrumentationPrompt(request: GenerateRequest): string {
  const selectedSurfaces = request.profileSnapshot.surfaces.filter((s) =>
    request.selectedSurfaceIds.includes(s.id),
  )
  const selectedPersonas = request.profileSnapshot.personas.filter((p) =>
    request.selectedPersonaIds.includes(p.id),
  )
  const surfacesList = selectedSurfaces.map((s) => `  - ${s.name}`).join('\n')
  const personasList = selectedPersonas.map((p) => `  - ${p.name}`).join('\n')

  return `Write the Instrumentation & Events section of a Key Requirements Document for the feature described below.

Feature Name: ${request.featureName}
Proposed Solution: ${request.proposedSolution}
V0 Scope: ${request.v0Scope}

Surfaces (every event's Surface column must contain one of these — no other values):
${surfacesList}

Personas:
${personasList}

Output a single table with these exact columns:

| Event Name | Trigger Action | Surface | Key Properties | Notes |

Rules:
- Include one row per significant user interaction or system state change for this feature
- Event names must be specific and descriptive (e.g. "alternate_contact_call_initiated" not "button_clicked")
- Trigger Action: describe the exact user action or system condition that fires the event (e.g. "User taps the alternate contact number")
- Surface: must be one of the surfaces listed above — no other values permitted
- Key Properties: list as "key (type)" pairs separated by commas — e.g. "feature_name (string), attempt_count (integer), success (boolean)"
- Include at minimum: a feature-viewed/opened event, the primary action event(s), a success event, and a failure/error event
- Notes: any additional context about when this event should fire or conditions that affect it

Do not include a preamble, closing summary, or any text outside the section content itself.`
}
