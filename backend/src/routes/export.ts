import { Router } from 'express'
import type { ExportRequest } from '@krd-tool/shared'
import { getSessionWithSections } from '../services/sessionService'
import { buildDocument } from '../services/docxService'

const router = Router()

router.post('/docx', async (req, res) => {
  const { sessionId } = req.body as ExportRequest

  if (!sessionId || typeof sessionId !== 'string') {
    res.status(400).json({ error: 'sessionId is required' })
    return
  }

  const session = await getSessionWithSections(sessionId).catch((err) => {
    console.error('[export] getSessionWithSections failed:', err)
    return null
  })

  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }

  const sections = session.sections ?? []

  const buffer = await buildDocument(session, sections).catch((err) => {
    console.error('[export] buildDocument failed:', err)
    return null
  })

  if (!buffer) {
    res.status(500).json({ error: 'Failed to generate document' })
    return
  }

  const safeName = session.featureName.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
  const filename = `${safeName}-KRD.docx`

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.send(buffer)
})

export default router
