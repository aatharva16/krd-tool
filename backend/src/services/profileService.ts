import type { Profile, CreateProfileRequest, UpdateProfileRequest } from '@krd-tool/shared'
import { supabase } from './supabase'

// ---------------------------------------------------------------------------
// snake_case → camelCase mapping for all profile rows coming out of Supabase
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfile(row: any): Profile {
  return {
    id: row.id,
    name: row.name,
    teamName: row.team_name ?? '',
    domainBrief: row.domain_brief ?? '',
    surfaces: row.surfaces ?? [],
    personas: row.personas ?? [],
    techConstraints: row.tech_constraints ?? '',
    teamRoster: row.team_roster ?? [],
    glossary: row.glossary ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUsedAt: row.last_used_at ?? null,
  }
}

// ---------------------------------------------------------------------------
// camelCase → snake_case for writes
// ---------------------------------------------------------------------------
function toDbRow(data: CreateProfileRequest | UpdateProfileRequest): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if ('name' in data && data.name !== undefined) row.name = data.name
  if ('teamName' in data && data.teamName !== undefined) row.team_name = data.teamName
  if ('domainBrief' in data && data.domainBrief !== undefined) row.domain_brief = data.domainBrief
  if ('surfaces' in data && data.surfaces !== undefined) row.surfaces = data.surfaces
  if ('personas' in data && data.personas !== undefined) row.personas = data.personas
  if ('techConstraints' in data && data.techConstraints !== undefined) row.tech_constraints = data.techConstraints
  if ('teamRoster' in data && data.teamRoster !== undefined) row.team_roster = data.teamRoster
  if ('glossary' in data && data.glossary !== undefined) row.glossary = data.glossary
  if ('lastUsedAt' in data && data.lastUsedAt !== undefined) row.last_used_at = data.lastUsedAt
  return row
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('last_used_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getAllProfiles: ${error.message}`)
  return (data ?? []).map(mapProfile)
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // no rows found
    throw new Error(`getProfileById: ${error.message}`)
  }
  return data ? mapProfile(data) : null
}

export async function createProfile(data: CreateProfileRequest): Promise<Profile> {
  const { data: row, error } = await supabase
    .from('profiles')
    .insert(toDbRow(data))
    .select()
    .single()

  if (error) throw new Error(`createProfile: ${error.message}`)
  return mapProfile(row)
}

export async function updateProfile(id: string, data: UpdateProfileRequest): Promise<Profile | null> {
  const { data: row, error } = await supabase
    .from('profiles')
    .update(toDbRow(data))
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`updateProfile: ${error.message}`)
  }
  return row ? mapProfile(row) : null
}

export async function deleteProfile(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from('profiles')
    .delete({ count: 'exact' })
    .eq('id', id)

  if (error) throw new Error(`deleteProfile: ${error.message}`)
  return (count ?? 0) > 0
}

export async function duplicateProfile(id: string): Promise<Profile | null> {
  const original = await getProfileById(id)
  if (!original) return null

  const { id: _id, createdAt: _c, updatedAt: _u, lastUsedAt: _l, name, ...rest } = original
  return createProfile({ ...rest, name: `${name} (copy)` })
}
