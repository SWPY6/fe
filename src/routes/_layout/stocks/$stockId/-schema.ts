import { z } from "zod"

export const stockChartIntervalSchema = z.enum(["1D", "1W", "1M", "3M", "1Y"])

export const stockSearchSchema = z.object({
  from: z.iso.date().optional().catch(undefined),
  to: z.iso.date().optional().catch(undefined),
  interval: stockChartIntervalSchema.default("1D").catch("1D"),
})
