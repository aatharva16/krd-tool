import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { GenerateRequest, Profile } from '@krd-tool/shared'
import { useKRDGeneration } from '../hooks/useKRDGeneration'
import { FeatureBriefForm, type FeatureBriefFormState } from '../components/FeatureBriefForm'
import { KRDDisplay } from '../components/KRDDisplay'
import { useProfileStore } from '../store/profileStore'

const EMPTY_BRIEF: FeatureBriefFormState = {
  featureName: '',
  problemStatement: '',
  proposedSolution: '',
  v0Scope: '',
  v1Scope: '',
  selectedSurfaceIds: [],
  selectedPersonaIds: [],
}

function isFormValid(brief: FeatureBriefFormState, hasProfile: boolean): boolean {
  return (
    hasProfile &&
    brief.featureName.trim() !== '' &&
    brief.problemStatement.trim() !== '' &&
    brief.proposedSolution.trim() !== '' &&
    brief.v0Scope.trim() !== '' &&
    brief.selectedSurfaceIds.length > 0 &&
    brief.selectedPersonaIds.length > 0
  )
}

function buildRequest(brief: FeatureBriefFormState, profile: Profile): GenerateRequest {
  return {
    profileSnapshot: {
      domainBrief: profile.domainBrief,
      surfaces: profile.surfaces,
      personas: profile.personas,
      techConstraints: profile.techConstraints,
      glossary: profile.glossary,
    },
    selectedSurfaceIds: brief.selectedSurfaceIds,
    selectedPersonaIds: brief.selectedPersonaIds,
    featureName: brief.featureName.trim(),
    problemStatement: brief.problemStatement.trim(),
    proposedSolution: brief.proposedSolution.trim(),
    v0Scope: brief.v0Scope.trim(),
    v1Scope: brief.v1Scope.trim(),
  }
}

export function GeneratePage() {
  const [brief, setBrief] = useState<FeatureBriefFormState>(EMPTY_BRIEF)

  const { sections, activeSectionKey, isGenerating, error, progress, generate, reset } =
    useKRDGeneration()

  const getActiveProfile = useProfileStore((s) => s.getActiveProfile)
  const activeProfile = getActiveProfile()
  const hasProfile = activeProfile !== null

  const canGenerate = !isGenerating && isFormValid(brief, hasProfile)
  const hasOutput = isGenerating || progress > 0 || activeSectionKey !== null
  const showReset = !isGenerating && (progress > 0 || error !== null)

  async function handleGenerate() {
    if (!activeProfile) return
    const request = buildRequest(brief, activeProfile)
    await generate(request)
  }

  const TOTAL_SECTIONS = 8

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* No-profile warning */}
      {!hasProfile && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <span>⚠</span>
          <span>
            Select a team profile before generating.{' '}
            <Link to="/profiles" className="font-medium underline hover:text-amber-900">
              Create or select a profile →
            </Link>
          </span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column — form */}
        <div className="lg:w-[420px] shrink-0 flex flex-col gap-6">

          {/* Active profile summary */}
          {activeProfile && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active profile</p>
                <Link to="/profiles" className="text-xs text-gray-400 hover:text-gray-600 underline">
                  Change
                </Link>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{activeProfile.name}</p>
              {activeProfile.teamName && (
                <p className="text-xs text-gray-500">{activeProfile.teamName}</p>
              )}
              {activeProfile.domainBrief && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{activeProfile.domainBrief}</p>
              )}
              <div className="flex gap-3 mt-2 text-xs text-gray-400">
                <span>{activeProfile.surfaces.length} surface{activeProfile.surfaces.length !== 1 ? 's' : ''}</span>
                <span>·</span>
                <span>{activeProfile.personas.length} persona{activeProfile.personas.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <FeatureBriefForm
              values={brief}
              onChange={setBrief}
              surfaces={activeProfile?.surfaces ?? []}
              personas={activeProfile?.personas ?? []}
              disabled={isGenerating}
            />
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
  )
}
