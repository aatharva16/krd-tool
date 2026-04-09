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

const RosterMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
})

const GlossaryEntrySchema = z.object({
  term: z.string(),
  definition: z.string(),
})

export const CreateProfileSchema = z.object({
  name: z.string().min(1, 'Profile name is required'),
  teamName: z.string().optional().default(''),
  domainBrief: z.string().optional().default(''),
  techConstraints: z.string().optional().default(''),
  surfaces: z.array(SurfaceSchema).optional().default([]),
  personas: z.array(PersonaSchema).optional().default([]),
  teamRoster: z.array(RosterMemberSchema).optional().default([]),
  glossary: z.array(GlossaryEntrySchema).optional().default([]),
})

export const UpdateProfileSchema = CreateProfileSchema.extend({
  lastUsedAt: z.string().optional(),
}).partial()

export type ValidatedCreateProfile = z.infer<typeof CreateProfileSchema>
export type ValidatedUpdateProfile = z.infer<typeof UpdateProfileSchema>

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): T | null {
  const result = schema.safeParse(body)
  return result.success ? result.data : null
}
