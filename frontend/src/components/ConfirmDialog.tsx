interface Props {
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ message, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  return (
    <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-2">
      <p>{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors font-medium"
        >
          {confirmLabel}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 rounded border border-amber-300 bg-white text-amber-700 hover:bg-amber-100 transition-colors"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  )
}
