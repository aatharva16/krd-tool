import { z, type ZodSchema } from 'zod'

const SurfaceSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const PersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
})

const ProfileSnapshotSchema = z.object({
  id: z.string(),
  name: z.string(),
  teamName: z.string(),
  domainBrief: z.string(),
  surfaces: z.array(SurfaceSchema),
  personas: z.array(PersonaSchema),
  techConstraints: z.string(),
  teamRoster: z.array(z.object({ name: z.string(), role: z.string() })),
  glossary: z.array(z.object({ term: z.string(), definition: z.string() })),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastUsedAt: z.string().nullable(),
})

export const CreateSessionSchema = z.object({
  profileId: z.string().nullable().optional().default(null),
  profileSnapshot: ProfileSnapshotSchema,
  featureName: z.string().min(1, 'Feature name is required'),
  problemStatement: z.string().optional().default(''),
  proposedSolution: z.string().optional().default(''),
  v0Scope: z.string().optional().default(''),
  v1Scope: z.string().optional().default(''),
  selectedSurfaces: z.array(SurfaceSchema),
  selectedPersonas: z.array(PersonaSchema),
})

export const UpdateSessionSchema = z.object({
  status: z.enum(['draft', 'generating', 'complete']).optional(),
  featureName: z.string().min(1).optional(),
  problemStatement: z.string().optional(),
  proposedSolution: z.string().optional(),
  v0Scope: z.string().optional(),
  v1Scope: z.string().optional(),
})

export const UpsertSectionSchema = z.object({
  content: z.string(),
  isManuallyEdited: z.boolean().optional().default(false),
})

export type ValidatedCreateSession = z.infer<typeof CreateSessionSchema>
export type ValidatedUpdateSession = z.infer<typeof UpdateSessionSchema>

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): T | null {
  const result = schema.safeParse(body)
  return result.success ? result.data : null
}
