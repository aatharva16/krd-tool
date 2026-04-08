import type { GenerateRequest } from '@krd-tool/shared'

export function buildSignoffPrompt(request: GenerateRequest): string {
  const selectedSurfaces = request.profileSnapshot.surfaces.filter((s) =>
    request.selectedSurfaceIds.includes(s.id),
  )
  const surfacesList = selectedSurfaces.map((s) => `  - ${s.name}`).join('\n')

  return `Write the Sign-off section of a Key Requirements Document for the feature described below.

Feature Name: ${request.featureName}

Surfaces:
${surfacesList}

Output a single table with these exact columns:

| Role | Name | Date | Signature |

Rules:
- Generate one row per surface listed above, using the surface name as the Role (e.g. "Rider App Owner", "Ops Dashboard Owner")
- Add exactly these three additional rows after the surface rows: Product, Tech Lead, Design
- Leave the Name, Date, and Signature columns blank — the team will fill these in
- Do not invent any other roles
- Total rows = number of surfaces + 3

Do not include a preamble, closing summary, or any text outside the section content itself.`
}
