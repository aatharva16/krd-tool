import { useState } from 'react'
import type { GenerateResponse } from '@krd-tool/shared'
import { generateKRD } from '../api/client'
import { ContextForm, type ContextFormState } from '../components/ContextForm'
import { FeatureBriefForm, type FeatureBriefFormState } from '../components/FeatureBriefForm'
import { KRDDisplay } from '../components/KRDDisplay'

const EMPTY_CONTEXT: ContextFormState = {
  domainBrief: '',
  surfaces: '',
  personas: '',
  techConstraints: '',
}

const EMPTY_BRIEF: FeatureBriefFormState = {
  featureName: '',
  problemStatement: '',
  proposedSolution: '',
  v0Scope: '',
  v1Scope: '',
}

function isFormValid(ctx: ContextFormState, brief: FeatureBriefFormState): boolean {
  return (
    ctx.domainBrief.trim() !== '' &&
    ctx.surfaces.trim() !== '' &&
    ctx.personas.trim() !== '' &&
    brief.featureName.trim() !== '' &&
    brief.problemStatement.trim() !== '' &&
    brief.proposedSolution.trim() !== '' &&
    brief.v0Scope.trim() !== ''
  )
}

export function GeneratePage() {
  const [context, setContext] = useState<ContextFormState>(EMPTY_CONTEXT)
  const [brief, setBrief] = useState<FeatureBriefFormState>(EMPTY_BRIEF)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GenerateResponse | null>(null)

  const canGenerate = !loading && isFormValid(context, brief)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const surfaces = context.surfaces
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

      const personas = context.personas
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean)

      const response = await generateKRD({
        domainBrief: context.domainBrief.trim(),
        surfaces,
        personas,
        techConstraints: context.techConstraints.trim(),
        featureName: brief.featureName.trim(),
        problemStatement: brief.problemStatement.trim(),
        proposedSolution: brief.proposedSolution.trim(),
        v0Scope: brief.v0Scope.trim(),
        v1Scope: brief.v1Scope.trim(),
      })

      setResult(response)
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Could not connect to server. Please check your connection and try again.')
        } else {
          setError(err.message)
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">KRD Tool</h1>
        <p className="text-sm text-gray-500 mt-0.5">Generate a Key Requirements Document from your feature brief</p>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column — form */}
          <div className="lg:w-[420px] shrink-0 flex flex-col gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <ContextForm values={context} onChange={setContext} disabled={loading} />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <FeatureBriefForm values={brief} onChange={setBrief} disabled={loading} />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating…' : 'Generate KRD'}
            </button>

            {loading && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600 font-medium">Generating your KRD…</p>
                <p className="text-xs text-gray-400">This takes up to 60 seconds — please wait</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Right column — output */}
          <div className="flex-1 min-w-0">
            {result ? (
              <KRDDisplay response={result} />
            ) : (
              !loading && (
                <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400">
                  Your generated KRD will appear here
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
