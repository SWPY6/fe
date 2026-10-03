import { z } from "zod"

export const moversFilterSchema = z.enum(["ALL", "UP", "DOWN", "VOLUME"])

export const moversSearchSchema = z.object({
  q: z.string().optional(),
  industry: z.string().optional(),
  sort: moversFilterSchema.default("UP").catch("UP"),
  page: z.number().int().positive().default(1).catch(1),
  includeCaution: z.boolean().default(false).catch(false),
})
