import type {
  KRDSession,
  KRDSection,
  CreateSessionRequest,
  UpdateSessionRequest,
  SessionStatus,
  SectionKey,
} from '@krd-tool/shared'
import { supabase } from './supabase'

// ---------------------------------------------------------------------------
// snake_case → camelCase mapping
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSection(row: any): KRDSection {
  return {
    id: row.id,
    sessionId: row.session_id,
    sectionKey: row.section_key as SectionKey,
    content: row.content ?? null,
    isManuallyEdited: row.is_manually_edited ?? false,
    generationCount: row.generation_count ?? 0,
    generatedAt: row.generated_at ?? null,
    updatedAt: row.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSession(row: any): KRDSession {
  const session: KRDSession = {
    id: row.id,
    profileId: row.profile_id ?? null,
    profileSnapshot: row.profile_snapshot,
    featureName: row.feature_name,
    problemStatement: row.problem_statement ?? '',
    proposedSolution: row.proposed_solution ?? '',
    v0Scope: row.v0_scope ?? '',
    v1Scope: row.v1_scope ?? '',
    selectedSurfaces: row.selected_surfaces ?? [],
    selectedPersonas: row.selected_personas ?? [],
    status: row.status as SessionStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
  // Attach sections when the join query populates krd_sections
  if (Array.isArray(row.krd_sections)) {
    session.sections = row.krd_sections.map(mapSection)
  }
  return session
}

// ---------------------------------------------------------------------------
// camelCase → snake_case for writes
// ---------------------------------------------------------------------------
function toSessionDbRow(data: CreateSessionRequest): Record<string, unknown> {
  return {
    profile_id: data.profileId ?? null,
    profile_snapshot: data.profileSnapshot,
    feature_name: data.featureName,
    problem_statement: data.problemStatement,
    proposed_solution: data.proposedSolution,
    v0_scope: data.v0Scope,
    v1_scope: data.v1Scope,
    selected_surfaces: data.selectedSurfaces,
    selected_personas: data.selectedPersonas,
  }
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function createSession(data: CreateSessionRequest): Promise<KRDSession> {
  const { data: row, error } = await supabase
    .from('krd_sessions')
    .insert(toSessionDbRow(data))
    .select()
    .single()

  if (error) throw new Error(`createSession: ${error.message}`)
  return mapSession(row)
}

export async function getAllSessions(): Promise<KRDSession[]> {
  const { data, error } = await supabase
    .from('krd_sessions')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`getAllSessions: ${error.message}`)
  return (data ?? []).map(mapSession)
}

export async function getSessionWithSections(id: string): Promise<KRDSession | null> {
  const { data, error } = await supabase
    .from('krd_sessions')
    .select('*, krd_sections(*)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // no rows found
    throw new Error(`getSessionWithSections: ${error.message}`)
  }
  return data ? mapSession(data) : null
}

export async function updateSessionStatus(id: string, status: SessionStatus): Promise<void> {
  const { error } = await supabase
    .from('krd_sessions')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(`updateSessionStatus: ${error.message}`)
}

export async function updateSession(id: string, data: UpdateSessionRequest): Promise<KRDSession | null> {
  const row: Record<string, unknown> = {}
  if (data.status !== undefined) row.status = data.status
  if (data.featureName !== undefined) row.feature_name = data.featureName
  if (data.problemStatement !== undefined) row.problem_statement = data.problemStatement
  if (data.proposedSolution !== undefined) row.proposed_solution = data.proposedSolution
  if (data.v0Scope !== undefined) row.v0_scope = data.v0Scope
  if (data.v1Scope !== undefined) row.v1_scope = data.v1Scope

  const { data: updated, error } = await supabase
    .from('krd_sessions')
    .update(row)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`updateSession: ${error.message}`)
  }
  return updated ? mapSession(updated) : null
}

export async function upsertSection(
  sessionId: string,
  sectionKey: SectionKey,
  content: string,
): Promise<KRDSection> {
  // Use the atomic RPC function to correctly increment generation_count
  const { data, error } = await supabase.rpc('upsert_krd_section', {
    p_session_id: sessionId,
    p_section_key: sectionKey,
    p_content: content,
  })

  if (error) throw new Error(`upsertSection: ${error.message}`)
  return mapSection(data)
}

export async function deleteSession(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from('krd_sessions')
    .delete({ count: 'exact' })
    .eq('id', id)

  if (error) throw new Error(`deleteSession: ${error.message}`)
  return (count ?? 0) > 0
}
