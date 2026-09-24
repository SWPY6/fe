import type { ChartPeriod } from "./ChartControls"
import type { ChartPoint } from "./IndexChart"

function exampleSeries(count: number, days: number): ChartPoint[] {
  return Array.from({ length: count }, (_, index) => ({
    date: new Date(
      Date.UTC(2026, 8, 4) - Math.round(((count - 1 - index) * days) / (count - 1)) * 86400000,
    )
      .toISOString()
      .slice(0, 10),
    value:
      Math.round(
        (2684.32 -
          (count - 1 - index) * 4 +
          (Math.sin(index * 0.8) - Math.sin((count - 1) * 0.8)) * 42) *
          100,
      ) / 100,
  }))
}
export const chartSeries: Record<ChartPeriod, ChartPoint[]> = {
  "1m": exampleSeries(12, 30),
  "3m": exampleSeries(24, 90),
  "6m": exampleSeries(36, 180),
  "1y": exampleSeries(52, 365),
}
export const emptyChartSeries: Record<ChartPeriod, ChartPoint[]> = {
  "1m": [],
  "3m": [],
  "6m": [],
  "1y": [],
}
