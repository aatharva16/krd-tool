import { Router, type Request, type Response } from 'express'
import type { GenerateRequest, SectionKey } from '@krd-tool/shared'
import { client, MODEL } from '../services/llm'
import { composePrompt } from '../prompts/composer'
import { updateSessionStatus, upsertSection } from '../services/sessionService'

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

type SSEPayload =
  | { type: 'section_start'; sectionKey: SectionKey }
  | { type: 'token'; sectionKey: SectionKey; delta: string }
  | { type: 'section_end'; sectionKey: SectionKey }
  | { type: 'done' }
  | { type: 'error'; message: string }

function sendEvent(res: Response, payload: SSEPayload): void {
  res.write('data: ' + JSON.stringify(payload) + '\n\n')
}

router.post('/', async (req: Request, res: Response) => {
  const body = req.body as GenerateRequest

  // Validate required fields — return 400 before opening the stream
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

  // Extract sessionId separately — kept out of the LLM request object intentionally
  const sessionId: string | null = typeof body.sessionId === 'string' ? body.sessionId : null

  // Set SSE headers and flush immediately so the browser starts reading the
  // stream body before the first OpenRouter response arrives.
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()
  req.socket?.setNoDelay(true) // disable Nagle — send each token event immediately

  // Track disconnection to avoid unnecessary OpenRouter calls
  let connectionClosed = false
  res.on('close', () => {
    connectionClosed = true
  })

  try {
    let hasUpdatedToGenerating = false
    let sectionContent = ''

    for (const sectionKey of SECTION_KEYS) {
      if (connectionClosed) break

      sectionContent = ''

      console.log(`[stream] Section start: ${sectionKey}`)
      sendEvent(res, { type: 'section_start', sectionKey })

      // Update session status to 'generating' on the first section (fire-and-forget)
      if (sessionId && !hasUpdatedToGenerating) {
        hasUpdatedToGenerating = true
        updateSessionStatus(sessionId, 'generating').catch((err) => {
          console.error('[stream] Failed to update session to generating:', err)
        })
      }

      const { system, user } = composePrompt(request, sectionKey)

      const stream = await client.chat.completions.create({
        model: MODEL,
        stream: true,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      })

      for await (const chunk of stream) {
        if (connectionClosed) break
        const delta = chunk.choices[0]?.delta?.content ?? ''
        if (delta) {
          sectionContent += delta // accumulate full content for DB save
          sendEvent(res, { type: 'token', sectionKey, delta })
        }
      }

      sendEvent(res, { type: 'section_end', sectionKey })
      console.log(`[stream] Section end: ${sectionKey}`)

      // Auto-save completed section to DB (fire-and-forget)
      if (sessionId && sectionContent) {
        const capturedKey = sectionKey
        const capturedContent = sectionContent
        upsertSection(sessionId, capturedKey, capturedContent).catch((err) => {
          console.error(`[stream] Failed to upsert section ${capturedKey}:`, err)
        })
      }
    }

    if (!connectionClosed) {
      sendEvent(res, { type: 'done' })
      // Mark session as complete (fire-and-forget)
      if (sessionId) {
        updateSessionStatus(sessionId, 'complete').catch((err) => {
          console.error('[stream] Failed to update session to complete:', err)
        })
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error during generation'
    console.error('[stream] Error:', message)
    if (!connectionClosed) {
      sendEvent(res, { type: 'error', message })
    }
  }

  res.end()
})

export default router
