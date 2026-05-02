import { z } from 'zod'

export const offsetSchema = z.coerce.number().int().min(0).catch(0)
