/* oxlint-disable react/no-array-index-key -- 동일 식별자의 반복 항목도 표시하도록 사용자 요청에 따라 순번을 조합한다. */
import type { StockChartResponse } from "@/api/generated/api.schemas"
import { Separator } from "@/components/ui/separator"

export function StockChart({
  candles,
  averageVolume,
  currency,
}: Pick<StockChartResponse, "candles" | "averageVolume" | "currency">) {
  const points = (candles ?? []).flatMap((candle) =>
    candle.close == null || !candle.tradeAt
      ? []
      : [{ close: candle.close, date: candle.tradeAt, volume: candle.volume }],
  )
  if (points.length === 0) return "표시할 차트 데이터가 없습니다"

  const minimum = Math.min(...points.map((point) => point.close))
  const maximum = Math.max(...points.map((point) => point.close))
  const maximumVolume = Math.max(1, ...points.map((point) => point.volume ?? 0))
  const coordinates = points.map((point, index) => ({
    x: points.length === 1 ? 410 : (index * 820) / (points.length - 1),
    y: maximum === minimum ? 130 : 240 - ((point.close - minimum) / (maximum - minimum)) * 220,
  }))

  return (
    <>
      <div className="mt-4 rounded-lg bg-muted p-4">
        <svg
          viewBox="0 0 900 260"
          className="h-64 w-full text-primary"

          aria-label="종가 흐름 차트"
        >
          <title>종가 흐름</title>
          <polyline
            points={coordinates.map((point) => `${point.x},${point.y}`).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
          {coordinates.length === 1 && (
            <circle cx={coordinates[0].x} cy={coordinates[0].y} r="4" fill="currentColor" />
          )}
          <text x="830" y="24" fill="var(--muted-foreground)" fontSize="12">
            {new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(maximum)}
          </text>
          <text x="830" y="244" fill="var(--muted-foreground)" fontSize="12">
            {new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(minimum)}
          </text>
        </svg>
        <div className="flex justify-between typo-helper text-muted-foreground">
          <span>{points[0].date}</span>
          <span>{currency}</span>
          <span>{points.at(-1)?.date}</span>
        </div>
      </div>
      <p className="mt-8 typo-helper text-muted-foreground">
        거래량 · 주 · 평균 {averageVolume?.toLocaleString("ko-KR") ?? "—"}주
      </p>
      <div className="mt-5 flex h-24 items-end gap-0.5" aria-label="거래량 막대 차트">
        {points.map((point, index) => (
          <span
            key={`${point.date}-${index}`}
            className="min-w-0 flex-1 bg-primary/60"
            style={{ height: `${((point.volume ?? 0) / maximumVolume) * 100}%` }}
            title={`${point.date}: ${point.volume?.toLocaleString("ko-KR") ?? "—"}주`}
          />
        ))}
      </div>
      <Separator />
    </>
  )
}
