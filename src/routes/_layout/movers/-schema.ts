import { z } from "zod"

export const moversFilterSchema = z.enum(["ALL", "UP", "DOWN", "VOLUME"])

export const moverIndustrySchema = z.enum([
  "AUTOMOBILE",
  "CONSTRUCTION",
  "TRANSPORT",
  "RETAIL",
  "FOOD_BEVERAGE",
  "TELECOM",
  "STEEL",
  "ENERGY",
  "CHEMICAL",
])

export const moversSearchSchema = z.object({
  q: z.string().optional(),
  industry: moverIndustrySchema.optional(),
  sort: moversFilterSchema.default("ALL").catch("ALL"),
  page: z.number().int().positive().default(1).catch(1),
})
