import { z } from "zod"

export const industryFilterSchema = z.enum(["ALL", "RISING", "FALLING"])

export const industriesSearchSchema = z.object({
  filter: industryFilterSchema.default("ALL").catch("ALL"),
})
