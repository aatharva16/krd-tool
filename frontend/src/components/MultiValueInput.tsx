interface FieldDef {
  key: string
  label: string
  placeholder: string
}

interface Props<T extends object> {
  value: T[]
  onChange: (updated: T[]) => void
  fields: FieldDef[]
  addLabel: string
  /** When true, each new item gets a client-generated `id` field (for surfaces and personas) */
  withId?: boolean
  disabled?: boolean
}

export function MultiValueInput<T extends object>({
  value,
  onChange,
  fields,
  addLabel,
  withId = false,
  disabled = false,
}: Props<T>) {
  function updateItem(index: number, field: string, newValue: string) {
    const updated = value.map((item, i) =>
      i === index ? { ...item, [field]: newValue } : item,
    )
    onChange(updated as T[])
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index) as T[])
  }

  function addItem() {
    const empty: Record<string, string> = {}
    if (withId) empty.id = crypto.randomUUID()
    fields.forEach((f) => { empty[f.key] = '' })
    onChange([...value, empty as T])
  }

  return (
    <div className="flex flex-col gap-2">
      {value.map((item, index) => (
        <div key={withId ? (item as Record<string, string>).id : index} className="flex gap-2 items-start">
          {fields.map((field) => (
            <input
              key={field.key}
              type="text"
              disabled={disabled}
              value={(item as Record<string, string | undefined>)[field.key] ?? ''}
              onChange={(e) => updateItem(index, field.key, e.target.value)}
              placeholder={field.placeholder}
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
            />
          ))}
          <button
            type="button"
            disabled={disabled}
            onClick={() => removeItem(index)}
            className="shrink-0 px-2 py-1.5 text-xs text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={addItem}
        className="self-start text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2 disabled:text-gray-300 disabled:cursor-not-allowed"
      >
        + Add {addLabel}
      </button>
    </div>
  )
}
