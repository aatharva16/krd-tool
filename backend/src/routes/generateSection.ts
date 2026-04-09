import { Router, type Request, type Response } from 'express'
import { SECTION_KEYS } from '@krd-tool/shared'
import type { SectionKey } from '@krd-tool/shared'
import { client, MODEL } from '../services/llm'
import { composeSectionRegeneratePrompt, composeSectionRefinePrompt } from '../prompts/composer'
import { getSessionWithSections, upsertSection } from '../services/sessionService'

const router = Router()

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
  const { sessionId, sectionKey, refineInstruction } = req.body as {
    sessionId?: unknown
    sectionKey?: unknown
    refineInstruction?: unknown
  }

  // Validate sessionId
  if (!sessionId || typeof sessionId !== 'string') {
    res.status(400).json({ error: 'Missing required field: sessionId' })
    return
  }

  // Validate sectionKey
  if (!sectionKey || typeof sectionKey !== 'string' || !(SECTION_KEYS as readonly string[]).includes(sectionKey)) {
    res.status(400).json({ error: `Invalid sectionKey: "${sectionKey}"` })
    return
  }

  // Validate optional refineInstruction
  if (refineInstruction !== undefined) {
    if (typeof refineInstruction !== 'string') {
      res.status(400).json({ error: 'refineInstruction must be a string' })
      return
    }
    if (refineInstruction.length < 5) {
      res.status(400).json({ error: 'refineInstruction must be at least 5 characters' })
      return
    }
    if (refineInstruction.length > 500) {
      res.status(400).json({ error: 'refineInstruction must be at most 500 characters' })
      return
    }
  }

  // Fetch session from DB
  const session = await getSessionWithSections(sessionId).catch(() => null)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }

  // Set SSE headers and flush
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()
  req.socket?.setNoDelay(true)

  let connectionClosed = false
  res.on('close', () => {
    connectionClosed = true
  })

  try {
    // Select prompt based on whether a refine instruction was provided
    const key = sectionKey as SectionKey
    let prompt: { system: string; user: string }

    if (refineInstruction && typeof refineInstruction === 'string') {
      const currentContent = session.sections?.find((s) => s.sectionKey === key)?.content ?? ''
      prompt = composeSectionRefinePrompt(session, key, currentContent, refineInstruction)
    } else {
      prompt = composeSectionRegeneratePrompt(session, key)
    }

    sendEvent(res, { type: 'section_start', sectionKey: key })
    console.log(`[generateSection] Start: ${key}`)

    const stream = await client.chat.completions.create({
      model: MODEL,
      stream: true,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
    })

    let fullContent = ''
    for await (const chunk of stream) {
      if (connectionClosed) break
      const delta = chunk.choices[0]?.delta?.content ?? ''
      if (delta) {
        fullContent += delta
        sendEvent(res, { type: 'token', sectionKey: key, delta })
      }
    }

    if (!connectionClosed) {
      sendEvent(res, { type: 'section_end', sectionKey: key })
      console.log(`[generateSection] End: ${key}`)

      // Auto-save to DB (AI-generated — isManuallyEdited: false)
      if (fullContent) {
        upsertSection(sessionId, key, fullContent, false).catch((err) => {
          console.error(`[generateSection] Failed to upsert section ${key}:`, err)
        })
      }

      sendEvent(res, { type: 'done' })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error during section generation'
    console.error('[generateSection] Error:', message)
    if (!connectionClosed) {
      sendEvent(res, { type: 'error', message })
    }
  }

  res.end()
})

export default router
