// Shared TypeScript types for KRD Tool
// Single source of truth for types used by both frontend and backend.

export const SECTION_KEYS = [
  'overview',
  'userStories',
  'requirements',
  'nfr',
  'instrumentation',
  'testing',
  'openQuestions',
  'signoff',
] as const

export type SectionKey = typeof SECTION_KEYS[number]

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
  // Optional session ID — when present, backend auto-saves sections to DB
  sessionId?: string
}

export interface GenerateResponse {
  sections: Record<SectionKey, string>
}

// ---------------------------------------------------------------------------
// Session types
// ---------------------------------------------------------------------------

export type SessionStatus = 'draft' | 'generating' | 'complete'

export interface KRDSection {
  id: string
  sessionId: string
  sectionKey: SectionKey
  content: string | null
  isManuallyEdited: boolean
  generationCount: number
  generatedAt: string | null
  updatedAt: string
}

export interface KRDSession {
  id: string
  profileId: string | null
  profileSnapshot: Profile
  featureName: string
  problemStatement: string
  proposedSolution: string
  v0Scope: string
  v1Scope: string
  selectedSurfaces: Surface[]
  selectedPersonas: Persona[]
  status: SessionStatus
  createdAt: string
  updatedAt: string
  sections?: KRDSection[]
}

export type CreateSessionRequest = Omit<KRDSession, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'sections'>
export type UpdateSessionRequest = Partial<Pick<KRDSession, 'status' | 'featureName' | 'problemStatement' | 'proposedSolution' | 'v0Scope' | 'v1Scope'>>

// ---------------------------------------------------------------------------
// Phase 4 — Refinement types
// ---------------------------------------------------------------------------

export interface GenerateSectionRequest {
  sessionId: string
  sectionKey: SectionKey
  refineInstruction?: string
}

export interface UpsertSectionRequest {
  content: string
  isManuallyEdited: boolean
}
