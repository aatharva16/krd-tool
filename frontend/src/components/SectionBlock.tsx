import { useState } from 'react'

interface Props {
  title: string
  content: string
  isActive: boolean
}

export function SectionBlock({ title, content, isActive }: Props) {
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const hasContent = content.length > 0
  const showCopy = !isActive && hasContent
  const showPlaceholder = !isActive && !hasContent

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-gray-600 text-left"
        >
          <span className="text-gray-400 text-xs">{collapsed ? '▶' : '▼'}</span>
          {title}
        </button>
        {showCopy && (
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
      {!collapsed && (
        <pre className="p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
          {showPlaceholder ? (
            <span className="text-gray-400 italic">Waiting…</span>
          ) : (
            <>
              {content}
              {isActive && <span className="cursor-blink ml-0.5">|</span>}
            </>
          )}
        </pre>
      )}
    </div>
  )
}
