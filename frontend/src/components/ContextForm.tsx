interface ContextFormState {
  domainBrief: string
  surfaces: string
  personas: string
  techConstraints: string
}

interface Props {
  values: ContextFormState
  onChange: (values: ContextFormState) => void
  disabled: boolean
}

export function ContextForm({ values, onChange, disabled }: Props) {
  function update(field: keyof ContextFormState) {
    return (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      onChange({ ...values, [field]: e.target.value })
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-900">Domain Context</h2>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Domain brief <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          disabled={disabled}
          value={values.domainBrief}
          onChange={update('domainBrief')}
          placeholder="Describe the product domain, team, and what the product does. E.g. 'A last-mile delivery platform for e-commerce in India.'"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400 resize-y"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Surfaces <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500">One per line — e.g. Rider App</p>
        <textarea
          rows={3}
          disabled={disabled}
          value={values.surfaces}
          onChange={update('surfaces')}
          placeholder={'Rider App\nOps Dashboard\nCustomer App'}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400 resize-y font-mono"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Personas <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500">One per line — Name: brief description</p>
        <textarea
          rows={3}
          disabled={disabled}
          value={values.personas}
          onChange={update('personas')}
          placeholder={'Delivery Rider: field agent making last-mile deliveries\nOperations Manager: monitors fleet performance'}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400 resize-y font-mono"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Technical constraints</label>
        <p className="text-xs text-gray-500">Optional — known architecture decisions, limitations, or integration constraints</p>
        <textarea
          rows={3}
          disabled={disabled}
          value={values.techConstraints}
          onChange={update('techConstraints')}
          placeholder="E.g. The rider app calls customers directly — no call bridge."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400 resize-y"
        />
      </div>
    </div>
  )
}

export type { ContextFormState }
