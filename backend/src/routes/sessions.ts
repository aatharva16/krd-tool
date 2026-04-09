import { Router, type Request, type Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import {
  createSession,
  getAllSessions,
  getSessionWithSections,
  updateSession,
  deleteSession,
  upsertSection,
} from '../services/sessionService'
import {
  CreateSessionSchema,
  UpdateSessionSchema,
  UpsertSectionSchema,
  validateBody,
} from '../validators/sessionValidator'
import { SECTION_KEYS } from '@krd-tool/shared'
import type { SectionKey } from '@krd-tool/shared'

const router = Router()

// GET /api/sessions — list all sessions
router.get('/', async (_req: Request, res: Response) => {
  try {
    const sessions = await getAllSessions()
    res.json(sessions)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch sessions'
    console.error('[sessions] GET /:', message)
    res.status(500).json({ error: message })
  }
})

// POST /api/sessions — create a new session
router.post('/', async (req: Request, res: Response) => {
  const data = validateBody(CreateSessionSchema, req.body)
  if (!data) {
    res.status(400).json({ error: 'Invalid request body — featureName and profileSnapshot are required' })
    return
  }
  try {
    const session = await createSession(data)
    res.status(201).json(session)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create session'
    console.error('[sessions] POST /:', message)
    res.status(500).json({ error: message })
  }
})

// GET /api/sessions/:id — get a single session with sections
router.get('/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const session = await getSessionWithSections(String(req.params.id))
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    res.json(session)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch session'
    console.error('[sessions] GET /:id:', message)
    res.status(500).json({ error: message })
  }
})

// PATCH /api/sessions/:id — update session status or fields
router.patch('/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  const data = validateBody(UpdateSessionSchema, req.body)
  if (!data) {
    res.status(400).json({ error: 'Invalid request body' })
    return
  }
  try {
    const session = await updateSession(String(req.params.id), data)
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    res.json(session)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update session'
    console.error('[sessions] PATCH /:id:', message)
    res.status(500).json({ error: message })
  }
})

// DELETE /api/sessions/:id — delete session and all its sections (CASCADE)
router.delete('/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const deleted = await deleteSession(String(req.params.id))
    if (!deleted) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    res.status(204).send()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete session'
    console.error('[sessions] DELETE /:id:', message)
    res.status(500).json({ error: message })
  }
})

// PATCH /api/sessions/:id/sections/:key — upsert a single section
router.patch('/:id/sections/:key', async (req: Request<ParamsDictionary>, res: Response) => {
  const sectionKey = String(req.params.key)
  if (!(SECTION_KEYS as readonly string[]).includes(sectionKey)) {
    res.status(400).json({ error: `Invalid sectionKey: "${sectionKey}"` })
    return
  }
  const data = validateBody(UpsertSectionSchema, req.body)
  if (!data) {
    res.status(400).json({ error: 'Invalid request body — content is required' })
    return
  }
  try {
    const section = await upsertSection(
      String(req.params.id),
      sectionKey as SectionKey,
      data.content,
      data.isManuallyEdited,
    )
    res.json(section)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to upsert section'
    console.error('[sessions] PATCH /:id/sections/:key:', message)
    res.status(500).json({ error: message })
  }
})

export default router
