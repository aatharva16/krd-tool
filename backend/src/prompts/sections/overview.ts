import type { GenerateRequest } from '@krd-tool/shared'

export function buildOverviewPrompt(request: GenerateRequest): string {
  return `Write the Overview section of a Key Requirements Document for the feature described below.

Feature Name: ${request.featureName}
Problem Statement: ${request.problemStatement}
Proposed Solution: ${request.proposedSolution}
V0 Scope: ${request.v0Scope}
V1 Scope: ${request.v1Scope || 'Not specified.'}

Output the section in this exact structure:

1. One-Line Summary
A single sentence that captures what this feature does and for whom.

2. Problem Statement
A concise description of the problem being solved. Reference the specific personas affected.

3. Proposed Solution
A concise description of the proposed solution. Reference the specific surfaces it appears on.

4. Success Metrics
Exactly 3 measurable success metrics. Each metric must include a numeric target (e.g. "reduce X by 15%", "achieve Y% adoption within 30 days"). Do not write vague metrics like "improve user experience". If a numeric target cannot be derived from the context, write the metric with a [TBD] placeholder for the number.

5. Scope
A two-column table with columns "V0 (Launch)" and "V1 (Follow-up)". List scope items as bullet points within each column. Do not write this as prose.

| V0 (Launch) | V1 (Follow-up) |
|---|---|
| • [item] | • [item] |

Do not include a preamble, closing summary, or any text outside the section content itself.`
}
