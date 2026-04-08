// Shared TypeScript types for KRD Tool
// Single source of truth for types used by both frontend and backend.

export type SectionKey =
  | 'overview'
  | 'userStories'
  | 'requirements'
  | 'nfr'
  | 'instrumentation'
  | 'testing'
  | 'openQuestions'
  | 'signoff'

export interface GenerateRequest {
  domainBrief: string
  surfaces: string[]
  personas: string[]
  techConstraints: string
  featureName: string
  problemStatement: string
  proposedSolution: string
  v0Scope: string
  v1Scope: string
}

export interface GenerateResponse {
  sections: Record<SectionKey, string>
}
