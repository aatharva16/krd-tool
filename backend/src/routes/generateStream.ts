import { Router, type Request, type Response } from 'express'
import type { GenerateRequest, SectionKey } from '@krd-tool/shared'
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

  // Set SSE headers and flush immediately so the browser starts reading the
  // stream body before the first OpenRouter response arrives.
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()
  req.socket?.setNoDelay(true)  // disable Nagle — send each token event immediately

  // Track disconnection to avoid unnecessary OpenRouter calls
  let connectionClosed = false
  res.on('close', () => {  // res.on fires on true client disconnect; req.on fires when POST body is consumed
    connectionClosed = true
  })

  try {
    for (const sectionKey of SECTION_KEYS) {
      if (connectionClosed) break

      console.log(`[stream] Section start: ${sectionKey}`)
      sendEvent(res, { type: 'section_start', sectionKey })

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
          sendEvent(res, { type: 'token', sectionKey, delta })
        }
      }

      sendEvent(res, { type: 'section_end', sectionKey })
      console.log(`[stream] Section end: ${sectionKey}`)
    }

    if (!connectionClosed) {
      sendEvent(res, { type: 'done' })
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
