import { useState } from 'react'
import type { Profile, CreateProfileRequest, Surface, Persona, RosterMember, GlossaryEntry } from '@krd-tool/shared'
import { MultiValueInput } from './MultiValueInput'

interface Props {
  initialValues: Profile | null
  onSubmit: (data: CreateProfileRequest) => void
  onCancel: () => void
  isLoading: boolean
}

interface FormState {
  name: string
  teamName: string
  domainBrief: string
  techConstraints: string
  surfaces: Surface[]
  personas: Persona[]
  teamRoster: RosterMember[]
  glossary: GlossaryEntry[]
}

function CharCounter({ value, limit }: { value: string; limit: number }) {
  const remaining = limit - value.length
  const isNear = remaining <= 50
  return (
    <span className={`text-xs ${isNear ? 'text-red-500' : 'text-gray-400'}`}>
      {remaining} / {limit}
    </span>
  )
}

const DOMAIN_BRIEF_LIMIT = 500
const TECH_CONSTRAINTS_LIMIT = 1000

export function ProfileForm({ initialValues, onSubmit, onCancel, isLoading }: Props) {
  const [form, setForm] = useState<FormState>({
    name: initialValues?.name ?? '',
    teamName: initialValues?.teamName ?? '',
    domainBrief: initialValues?.domainBrief ?? '',
    techConstraints: initialValues?.techConstraints ?? '',
    surfaces: initialValues?.surfaces ?? [],
    personas: initialValues?.personas ?? [],
    teamRoster: initialValues?.teamRoster ?? [],
    glossary: initialValues?.glossary ?? [],
  })

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      name: form.name.trim(),
      teamName: form.teamName.trim(),
      domainBrief: form.domainBrief.trim(),
      techConstraints: form.techConstraints.trim(),
      surfaces: form.surfaces,
      personas: form.personas,
      teamRoster: form.teamRoster,
      glossary: form.glossary,
    })
  }

  const canSave = form.name.trim() !== '' && !isLoading

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Profile name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Profile name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="E.g. LM RTO POD"
          disabled={isLoading}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50"
        />
      </div>

      {/* Team name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Team name</label>
        <input
          type="text"
          value={form.teamName}
          onChange={(e) => set('teamName', e.target.value)}
          placeholder="E.g. Growth Team"
          disabled={isLoading}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50"
        />
      </div>

      {/* Domain brief */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Domain brief</label>
          <CharCounter value={form.domainBrief} limit={DOMAIN_BRIEF_LIMIT} />
        </div>
        <textarea
          rows={4}
          value={form.domainBrief}
          onChange={(e) => set('domainBrief', e.target.value.slice(0, DOMAIN_BRIEF_LIMIT))}
          placeholder="Describe the product domain, team, and what the product does."
          disabled={isLoading}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 resize-y"
        />
      </div>

      {/* Surfaces */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Surfaces</label>
        <p className="text-xs text-gray-500">Product areas this team works on</p>
        <MultiValueInput<Surface>
          value={form.surfaces}
          onChange={(v) => set('surfaces', v)}
          fields={[{ key: 'name', label: 'Surface name', placeholder: 'E.g. Rider App' }]}
          addLabel="surface"
          withId
          disabled={isLoading}
        />
      </div>

      {/* Personas */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Personas</label>
        <p className="text-xs text-gray-500">The people who use this team's product</p>
        <MultiValueInput<Persona>
          value={form.personas}
          onChange={(v) => set('personas', v)}
          fields={[
            { key: 'name', label: 'Persona name', placeholder: 'E.g. Delivery Rider' },
            { key: 'description', label: 'Description', placeholder: 'Brief description of this persona' },
          ]}
          addLabel="persona"
          withId
          disabled={isLoading}
        />
      </div>

      {/* Technical constraints */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Technical constraints</label>
          <CharCounter value={form.techConstraints} limit={TECH_CONSTRAINTS_LIMIT} />
        </div>
        <p className="text-xs text-gray-500">Known architecture decisions, limitations, or integration constraints</p>
        <textarea
          rows={3}
          value={form.techConstraints}
          onChange={(e) => set('techConstraints', e.target.value.slice(0, TECH_CONSTRAINTS_LIMIT))}
          placeholder="E.g. The rider app calls customers directly — no call bridge."
          disabled={isLoading}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 resize-y"
        />
      </div>

      {/* Team roster */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Team roster</label>
        <p className="text-xs text-gray-500">Used in the KRD sign-off section</p>
        <MultiValueInput<RosterMember>
          value={form.teamRoster}
          onChange={(v) => set('teamRoster', v)}
          fields={[
            { key: 'name', label: 'Name', placeholder: 'E.g. Atharva' },
            { key: 'role', label: 'Role', placeholder: 'E.g. Product Manager' },
          ]}
          addLabel="team member"
          disabled={isLoading}
        />
      </div>

      {/* Glossary */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Glossary</label>
        <p className="text-xs text-gray-500">Domain terms injected into every generation prompt</p>
        <MultiValueInput<GlossaryEntry>
          value={form.glossary}
          onChange={(v) => set('glossary', v)}
          fields={[
            { key: 'term', label: 'Term', placeholder: 'E.g. OFD' },
            { key: 'definition', label: 'Definition', placeholder: 'E.g. Out for delivery' },
          ]}
          addLabel="term"
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-gray-200">
        <button
          type="submit"
          disabled={!canSave}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving…' : 'Save profile'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:text-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
