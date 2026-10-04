import { useSuspenseQuery } from "@tanstack/react-query"

import { getChartSuspenseQueryOptions } from "@/api/generated/api"

export function StockSparkline({
  stockId,
  name,
  changeRate,
}: {
  stockId: number
  name: string
  changeRate: number
}) {
  const { data } = useSuspenseQuery(getChartSuspenseQueryOptions(stockId))
  const closes = (data.data.candles ?? []).flatMap((candle) =>
    candle.close == null ? [] : [candle.close],
  )
  if (closes.length < 2) return <span className="text-muted-foreground">—</span>
  const low = Math.min(...closes)
  const high = Math.max(...closes)
  let color = "text-muted-foreground"
  if (changeRate > 0) color = "text-positive"
  if (changeRate < 0) color = "text-negative"
  return (
    <svg viewBox="0 0 128 48" preserveAspectRatio="none" className={`ml-auto h-10 w-32 ${color}`}>
      <title>{name} 최근 종가 흐름</title>
      <polyline
        points={closes
          .map(
            (close, index) =>
              `${(index * 128) / (closes.length - 1)},${high === low ? 24 : 44 - ((close - low) / (high - low)) * 40}`,
          )
          .join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
