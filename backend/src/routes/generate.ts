import { Router, type Request, type Response } from 'express'
import type { GenerateRequest, GenerateResponse, SectionKey } from '@krd-tool/shared'
import { client, MODEL } from '../services/llm'
import { composePrompt } from '../prompts/composer'

const router = Router()

const SECTION_KEYS: SectionKey[] = [
  'overview',
  'userStories',
  'requirements',
  'nfr',
  'instrumentation',
  'testing',
  'openQuestions',
  'signoff',
]

function validateRequest(body: GenerateRequest): string | null {
  if (!body.profileSnapshot || typeof body.profileSnapshot !== 'object') {
    return 'Missing required field: profileSnapshot'
  }
  if (!Array.isArray(body.selectedSurfaceIds) || body.selectedSurfaceIds.length === 0) {
    return 'At least one surface must be selected'
  }
  if (!Array.isArray(body.selectedPersonaIds) || body.selectedPersonaIds.length === 0) {
    return 'At least one persona must be selected'
  }
  for (const field of ['featureName', 'problemStatement', 'proposedSolution', 'v0Scope'] as const) {
    if (!body[field] || body[field].trim() === '') {
      return `Missing required field: ${field}`
    }
  }
  return null
}

router.post('/', async (req: Request, res: Response) => {
  const body = req.body as GenerateRequest

  const validationError = validateRequest(body)
  if (validationError) {
    res.status(400).json({ error: validationError })
    return
  }

  const request: GenerateRequest = {
    profileSnapshot: body.profileSnapshot,
    selectedSurfaceIds: body.selectedSurfaceIds,
    selectedPersonaIds: body.selectedPersonaIds,
    featureName: body.featureName.trim(),
    problemStatement: body.problemStatement.trim(),
    proposedSolution: body.proposedSolution.trim(),
    v0Scope: body.v0Scope.trim(),
    v1Scope: (body.v1Scope ?? '').trim(),
  }

  const sections: Partial<Record<SectionKey, string>> = {}

  for (const sectionKey of SECTION_KEYS) {
    console.log(`[generate] Generating section: ${sectionKey}`)
    const { system, user } = composePrompt(request, sectionKey)

    const completion = await client.chat.completions.create({
      model: MODEL,
      stream: false,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    })

    sections[sectionKey] = completion.choices[0]?.message?.content ?? ''
    console.log(`[generate] Section complete: ${sectionKey}`)
  }

  const response: GenerateResponse = { sections: sections as Record<SectionKey, string> }
  res.status(200).json(response)
})

export default router
