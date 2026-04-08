import type { GenerateRequest } from '@krd-tool/shared'

export function buildTestingPrompt(request: GenerateRequest): string {
  return `Write the Testing Checklist section of a Key Requirements Document for the feature described below.

Feature Name: ${request.featureName}
Proposed Solution: ${request.proposedSolution}
V0 Scope: ${request.v0Scope}
Technical Constraints: ${request.techConstraints || 'None specified.'}

Output the section with exactly these four categories. Each category must have at least 3 checklist items. Write each item as a checkbox: "- [ ] [test description]"

### Functional
Test items that verify the core feature behaviour works as specified. Reference the surfaces and personas from the context.

### Edge Cases
Test items that verify behaviour at boundaries, failure conditions, and exceptional paths. Include scenarios where data is missing, the network is slow or unavailable, or the user performs unexpected actions.

### Instrumentation Validation
Test items that verify all tracking events fire correctly. Must include:
- [ ] All instrumentation events fire correctly in a production build
- [ ] Event properties contain the correct data types and values
(Add at least 1 more feature-specific instrumentation check)

### Launch Gates
Must-pass criteria before the feature can be released. Must include:
- [ ] All instrumentation events fire correctly with no missing properties
- [ ] No console errors or warnings in the production build
- [ ] PM sign-off complete
(Add at least 1 more feature-specific launch gate)

Do not include a preamble, closing summary, or any text outside the section content itself.`
}
