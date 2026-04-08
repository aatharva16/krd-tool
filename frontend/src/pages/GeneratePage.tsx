import { useState } from 'react'
import type { GenerateRequest } from '@krd-tool/shared'
import { useKRDGeneration } from '../hooks/useKRDGeneration'
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

function buildRequest(context: ContextFormState, brief: FeatureBriefFormState): GenerateRequest {
  return {
    domainBrief: context.domainBrief.trim(),
    surfaces: context.surfaces.split('\n').map((s) => s.trim()).filter(Boolean),
    personas: context.personas.split('\n').map((p) => p.trim()).filter(Boolean),
    techConstraints: context.techConstraints.trim(),
    featureName: brief.featureName.trim(),
    problemStatement: brief.problemStatement.trim(),
    proposedSolution: brief.proposedSolution.trim(),
    v0Scope: brief.v0Scope.trim(),
    v1Scope: brief.v1Scope.trim(),
  }
}

export function GeneratePage() {
  const [context, setContext] = useState<ContextFormState>(EMPTY_CONTEXT)
  const [brief, setBrief] = useState<FeatureBriefFormState>(EMPTY_BRIEF)

  const { sections, activeSectionKey, isGenerating, error, progress, generate, reset } =
    useKRDGeneration()

  const canGenerate = !isGenerating && isFormValid(context, brief)
  const hasOutput = isGenerating || progress > 0 || activeSectionKey !== null
  const showReset = !isGenerating && (progress > 0 || error !== null)

  async function handleGenerate() {
    await generate(buildRequest(context, brief))
  }

  const TOTAL_SECTIONS = 8

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
              <ContextForm values={context} onChange={setContext} disabled={isGenerating} />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <FeatureBriefForm values={brief} onChange={setBrief} disabled={isGenerating} />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating…' : 'Generate KRD'}
            </button>

            {showReset && (
              <button
                onClick={reset}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            )}

            {isGenerating && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600 font-medium">
                  {activeSectionKey
                    ? `Generating section ${progress + 1} of ${TOTAL_SECTIONS}…`
                    : 'Starting generation…'}
                </p>
                <p className="text-xs text-gray-400">Content streams in as each section completes</p>
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
            {hasOutput ? (
              <KRDDisplay sections={sections} activeSectionKey={activeSectionKey} />
            ) : (
              !isGenerating && (
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
