import { useEffect, useState } from 'react'

type BackendStatus = 'checking' | 'connected' | 'unreachable'

function App() {
  const [status, setStatus] = useState<BackendStatus>('checking')

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL as string
    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (res.ok) setStatus('connected')
        else setStatus('unreachable')
      })
      .catch(() => setStatus('unreachable'))
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold text-gray-900">KRD Tool</h1>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {status === 'checking' && (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span>Checking backend…</span>
          </>
        )}
        {status === 'connected' && (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span>Backend connected</span>
          </>
        )}
        {status === 'unreachable' && (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Backend unreachable</span>
          </>
        )}
      </div>
    </div>
  )
}

export default App
