import type { Surface, Persona } from '@krd-tool/shared'

const CHAR_LIMIT = 400

export interface FeatureBriefFormState {
  featureName: string
  problemStatement: string
  proposedSolution: string
  v0Scope: string
  v1Scope: string
  selectedSurfaceIds: string[]
  selectedPersonaIds: string[]
}

interface Props {
  values: FeatureBriefFormState
  onChange: (values: FeatureBriefFormState) => void
  surfaces: Surface[]
  personas: Persona[]
  disabled: boolean
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

function MultiCheckbox({
  items,
  selectedIds,
  onToggle,
  disabled,
}: {
  items: { id: string; label: string }[]
  selectedIds: string[]
  onToggle: (id: string) => void
  disabled: boolean
}) {
  if (items.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">
        No items in active profile — add them in{' '}
        <a href="/profiles" className="underline hover:text-gray-600">Profiles</a>.
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <label key={item.id} className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            disabled={disabled}
            checked={selectedIds.includes(item.id)}
            onChange={() => onToggle(item.id)}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-400 disabled:cursor-not-allowed"
          />
          <span className="text-sm text-gray-700">{item.label}</span>
        </label>
      ))}
    </div>
  )
}

export function FeatureBriefForm({ values, onChange, surfaces, personas, disabled }: Props) {
  function update(field: keyof FeatureBriefFormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = e.target.value
      const limited = ['problemStatement', 'proposedSolution'].includes(field)
        ? raw.slice(0, CHAR_LIMIT)
        : raw
      onChange({ ...values, [field]: limited })
    }
  }

  function toggleSurface(id: string) {
    const next = values.selectedSurfaceIds.includes(id)
      ? values.selectedSurfaceIds.filter((s) => s !== id)
      : [...values.selectedSurfaceIds, id]
    onChange({ ...values, selectedSurfaceIds: next })
  }

  function togglePersona(id: string) {
    const next = values.selectedPersonaIds.includes(id)
      ? values.selectedPersonaIds.filter((p) => p !== id)
      : [...values.selectedPersonaIds, id]
    onChange({ ...values, selectedPersonaIds: next })
  }

  const surfaceItems = surfaces.map((s) => ({ id: s.id, label: s.name }))
  const personaItems = personas.map((p) => ({
    id: p.id,
    label: p.description ? `${p.name} — ${p.description}` : p.name,
  }))

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-900">Feature Brief</h2>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Feature name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          disabled={disabled}
          value={values.featureName}
          onChange={update('featureName')}
          placeholder="E.g. Alternate Contact Number"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Problem statement <span className="text-red-500">*</span>
          </label>
          <CharCounter value={values.problemStatement} limit={CHAR_LIMIT} />
        </div>
        <textarea
          rows={3}
          disabled={disabled}
          value={values.problemStatement}
          onChange={update('problemStatement')}
          placeholder="What problem does this feature solve? Who experiences it and when?"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400 resize-y"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Proposed solution <span className="text-red-500">*</span>
          </label>
          <CharCounter value={values.proposedSolution} limit={CHAR_LIMIT} />
        </div>
        <textarea
          rows={3}
          disabled={disabled}
          value={values.proposedSolution}
          onChange={update('proposedSolution')}
          placeholder="How does this feature address the problem?"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400 resize-y"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          V0 scope <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500">What ships at launch?</p>
        <textarea
          rows={3}
          disabled={disabled}
          value={values.v0Scope}
          onChange={update('v0Scope')}
          placeholder="E.g. Show alternate number if available. Allow one-tap call from the rider app."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400 resize-y"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">V1 scope</label>
        <p className="text-xs text-gray-500">Optional — what follows in the next iteration?</p>
        <textarea
          rows={2}
          disabled={disabled}
          value={values.v1Scope}
          onChange={update('v1Scope')}
          placeholder="E.g. Capture alternate number during order placement."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400 resize-y"
        />
      </div>

      {/* Surfaces */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Affected surfaces <span className="text-red-500">*</span>
        </label>
        <MultiCheckbox
          items={surfaceItems}
          selectedIds={values.selectedSurfaceIds}
          onToggle={toggleSurface}
          disabled={disabled}
        />
      </div>

      {/* Personas */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Affected personas <span className="text-red-500">*</span>
        </label>
        <MultiCheckbox
          items={personaItems}
          selectedIds={values.selectedPersonaIds}
          onToggle={togglePersona}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
