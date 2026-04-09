import { useState } from 'react'

interface Props {
  onRefine: (instruction: string) => void
  isDisabled: boolean
}

export function RefineInput({ onRefine, isDisabled }: Props) {
  const [instruction, setInstruction] = useState('')

  function handleApply() {
    if (isDisabled || instruction.trim().length < 5) return
    onRefine(instruction.trim())
    setInstruction('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !isDisabled && instruction.trim().length >= 5) {
      handleApply()
    }
  }

  const canApply = !isDisabled && instruction.trim().length >= 5

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g. add edge cases for offline state, make acceptance criteria more specific..."
        disabled={isDisabled}
        className="flex-1 text-xs px-3 py-2 rounded border border-gray-300 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        onClick={handleApply}
        disabled={!canApply}
        className="text-xs px-3 py-2 rounded border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        Apply
      </button>
    </div>
  )
}
