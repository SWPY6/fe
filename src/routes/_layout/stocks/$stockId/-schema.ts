// 종목 상세 페이지의 URL 검색 조건과 기본 조회 정책을 정의하는 스키마.
// URL에 날짜가 없으면 기본적으로 최근 1개월 범위로 조회를 요청한다.
import { z } from "zod"

export const stockChartIntervalSchema = z.enum(["1D", "1W", "1M", "3M", "1Y"])

function getDefaultStockSearch(to = new Date().toISOString().slice(0, 10)) {
  const start = new Date(to)
  const day = start.getUTCDate()
  start.setUTCDate(1)
  start.setUTCMonth(start.getUTCMonth() - 1)
  const lastDay = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
  ).getUTCDate()
  start.setUTCDate(Math.min(day, lastDay))

  return {
    from: start.toISOString().slice(0, 10),
    to,
    interval: stockChartIntervalSchema.enum["1D"],
  }
}

export const stockSearchSchema = z
  .object({
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
    interval: stockChartIntervalSchema.default("1D").catch("1D"),
  })
  .transform(({ from, to, interval }) => {
    const defaults = getDefaultStockSearch(to)

    return { from: from ?? defaults.from, to: defaults.to, interval }
  })
  .refine(({ from, to }) => {
    const start = new Date(from)
    const end = new Date(to)
    const limit = new Date(start)
    limit.setUTCFullYear(limit.getUTCFullYear() + 5)
    if (limit.getUTCMonth() !== start.getUTCMonth()) limit.setUTCDate(0)

    return start <= end && end <= limit
  })
  .catch(() => getDefaultStockSearch())
