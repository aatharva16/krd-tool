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

const REQUIRED_FIELDS: (keyof GenerateRequest)[] = [
  'domainBrief',
  'surfaces',
  'personas',
  'featureName',
  'problemStatement',
  'proposedSolution',
  'v0Scope',
]

router.post('/', async (req: Request, res: Response) => {
  const body = req.body as GenerateRequest

  // Validate required fields
  for (const field of REQUIRED_FIELDS) {
    const value = body[field]
    if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')) {
      res.status(400).json({ error: `Missing required field: ${field}` })
      return
    }
  }

  const request: GenerateRequest = {
    domainBrief: body.domainBrief.trim(),
    surfaces: body.surfaces.map((s: string) => s.trim()).filter(Boolean),
    personas: body.personas.map((p: string) => p.trim()).filter(Boolean),
    techConstraints: (body.techConstraints ?? '').trim(),
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
