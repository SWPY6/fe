import { z } from "zod"

export const stockChartIntervalSchema = z.enum(["1D", "1W", "1M", "3M", "1Y"])

export const stockSearchSchema = z
  .object({
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
    interval: stockChartIntervalSchema.default("1D").catch("1D"),
  })
  .refine(({ from, to }) => {
    if (!from) return true

    const start = new Date(from)
    const end = new Date(to ?? new Date().toISOString().slice(0, 10))
    const limit = new Date(start)
    limit.setUTCFullYear(limit.getUTCFullYear() + 5)
    if (limit.getUTCMonth() !== start.getUTCMonth()) limit.setUTCDate(0)

    return start <= end && end <= limit
  })
  .catch(() => {
    const end = new Date()
    const start = new Date(end)
    const day = start.getUTCDate()
    start.setUTCDate(1)
    start.setUTCMonth(start.getUTCMonth() - 1)
    const lastDay = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
    ).getUTCDate()
    start.setUTCDate(Math.min(day, lastDay))

    return {
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
      interval: stockChartIntervalSchema.enum["1D"],
    }
  })
