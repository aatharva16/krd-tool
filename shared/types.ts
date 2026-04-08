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

// ---------------------------------------------------------------------------
// Profile types
// ---------------------------------------------------------------------------

export interface Surface {
  id: string
  name: string
}

export interface Persona {
  id: string
  name: string
  description: string
}

export interface RosterMember {
  name: string
  role: string
}

export interface GlossaryEntry {
  term: string
  definition: string
}

export interface Profile {
  id: string
  name: string
  teamName: string
  domainBrief: string
  surfaces: Surface[]
  personas: Persona[]
  techConstraints: string
  teamRoster: RosterMember[]
  glossary: GlossaryEntry[]
  createdAt: string
  updatedAt: string
  lastUsedAt: string | null
}

export type CreateProfileRequest = Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'lastUsedAt'>
export type UpdateProfileRequest = Partial<CreateProfileRequest> & { lastUsedAt?: string }

// ---------------------------------------------------------------------------
// Generation types
// ---------------------------------------------------------------------------

export interface GenerateRequest {
  // Profile context — assembled from active profile on frontend, sent to backend
  profileSnapshot: Pick<Profile, 'domainBrief' | 'surfaces' | 'personas' | 'techConstraints' | 'glossary'>
  // IDs of the surfaces/personas the user selected in the feature brief form
  selectedSurfaceIds: string[]
  selectedPersonaIds: string[]
  // Feature brief (per-session)
  featureName: string
  problemStatement: string
  proposedSolution: string
  v0Scope: string
  v1Scope: string
}

export interface GenerateResponse {
  sections: Record<SectionKey, string>
}
