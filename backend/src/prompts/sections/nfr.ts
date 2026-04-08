import type { GenerateRequest } from '@krd-tool/shared'

export function buildNfrPrompt(request: GenerateRequest): string {
  const surfacesList = request.surfaces.map((s) => `  - ${s}`).join('\n')

  return `Write the Non-Functional Requirements section of a Key Requirements Document for the feature described below.

Feature Name: ${request.featureName}
Proposed Solution: ${request.proposedSolution}
Technical Constraints: ${request.techConstraints || 'None specified.'}

Surfaces:
${surfacesList}

Output the section with these four sub-sections, each with a table:

### Performance
| Requirement | Target | Notes |

### Reliability
| Requirement | Target | Notes |

### Security
| Requirement | Target | Notes |

### Accessibility
| Requirement | Target | Notes |

Rules:
- Every requirement must be specific to this feature — do not write generic web application NFRs like "the system should be fast" or "the system should be secure"
- Where a numeric target is appropriate (e.g. response time in ms, uptime %, error rate %), include it
- Where a numeric target is not known from the context, write "TBD" in the Target column
- NFRs must relate to the surfaces and technical constraints described above
- Do not invent technical constraints not mentioned in the context — if a constraint is unclear, write the NFR with a TBD target and add a note that the target needs confirmation

Do not include a preamble, closing summary, or any text outside the section content itself.`
}
