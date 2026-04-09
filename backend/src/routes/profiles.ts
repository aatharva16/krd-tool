import { Router, type Request, type Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  duplicateProfile,
} from '../services/profileService'
import { CreateProfileSchema, UpdateProfileSchema, validateBody } from '../validators/profileValidator'

const router = Router()

// GET /api/profiles — list all profiles
router.get('/', async (_req: Request, res: Response) => {
  try {
    const profiles = await getAllProfiles()
    res.json(profiles)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch profiles'
    console.error('[profiles] GET /:', message)
    res.status(500).json({ error: message })
  }
})

// POST /api/profiles — create a new profile
router.post('/', async (req: Request, res: Response) => {
  const data = validateBody(CreateProfileSchema, req.body)
  if (!data) {
    res.status(400).json({ error: 'Invalid request body — name is required' })
    return
  }
  try {
    const created = await createProfile(data)
    res.status(201).json(created)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create profile'
    console.error('[profiles] POST /:', message)
    res.status(500).json({ error: message })
  }
})

// GET /api/profiles/:id — get a single profile
router.get('/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const profile = await getProfileById(String(req.params.id))
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' })
      return
    }
    res.json(profile)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch profile'
    console.error('[profiles] GET /:id:', message)
    res.status(500).json({ error: message })
  }
})

// PATCH /api/profiles/:id — partial update
router.patch('/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  const data = validateBody(UpdateProfileSchema, req.body)
  if (!data) {
    res.status(400).json({ error: 'Invalid request body' })
    return
  }
  try {
    const profile = await updateProfile(String(req.params.id), data)
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' })
      return
    }
    res.json(profile)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update profile'
    console.error('[profiles] PATCH /:id:', message)
    res.status(500).json({ error: message })
  }
})

// DELETE /api/profiles/:id — delete a profile
router.delete('/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const deleted = await deleteProfile(String(req.params.id))
    if (!deleted) {
      res.status(404).json({ error: 'Profile not found' })
      return
    }
    res.status(204).send()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete profile'
    console.error('[profiles] DELETE /:id:', message)
    res.status(500).json({ error: message })
  }
})

// POST /api/profiles/:id/duplicate — duplicate a profile
router.post('/:id/duplicate', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const profile = await duplicateProfile(String(req.params.id))
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' })
      return
    }
    res.status(201).json(profile)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to duplicate profile'
    console.error('[profiles] POST /:id/duplicate:', message)
    res.status(500).json({ error: message })
  }
})

export default router
