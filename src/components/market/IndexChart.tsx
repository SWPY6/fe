import { useId, useState } from "react"
import { ChangeRate } from "../common/ChangeRate"
import { DataTimestamp, type DataTimestampProps } from "../common/DataTimestamp"
import { Card, CardHeader, CardContent } from "../ui/card"
import { ChartControls, type ChartPeriod, type ChartShape } from "./ChartControls"

export type ChartPoint = { date: string; value: number }
type IndexChartProps = {
  name: string
  value: number
  change: number | null
  unit: string
  timestamp: DataTimestampProps
  series: Record<ChartPeriod, ChartPoint[]>
  initialPeriod?: ChartPeriod
  initialShape?: ChartShape
  initialZoom?: number
}
export function IndexChart({
  name,
  value,
  change,
  unit,
  timestamp,
  series,
  initialPeriod = "1m",
  initialShape = "line",
  initialZoom = 1,
}: IndexChartProps) {
  const [period, setPeriod] = useState(initialPeriod)
  const [shape, setShape] = useState(initialShape)
  const [zoom, setZoom] = useState(initialZoom)
  const id = useId()
  const validPoints = series[period].filter((point) => Number.isFinite(point.value))
  const points = validPoints.slice(-Math.max(2, Math.ceil(validPoints.length / zoom)))
  const min = points.length ? Math.min(...points.map((point) => point.value)) : 0
  const max = points.length ? Math.max(...points.map((point) => point.value)) : 1
  const padding = Math.max((max - min) * 0.15, Math.abs(max) * 0.001, 1)
  const low = min - padding
  const high = max + padding
  const coordinates = points.map((point, index) => ({
    x: 65 + (index / Math.max(1, points.length - 1)) * 615,
    y: 220 - ((point.value - low) / (high - low)) * 190,
  }))
  const path = coordinates
    .map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`)
    .join(" ")
  const last = coordinates.at(-1)
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{name} · 예시 차트</h2>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {value.toLocaleString("ko-KR")} <span className="text-sm font-normal">{unit}</span>{" "}
              <ChangeRate value={change} />
            </p>
          </div>
          <DataTimestamp {...timestamp} />
        </div>
        <ChartControls
          period={period}
          shape={shape}
          zoom={zoom}
          onPeriodChange={(next) => {
            setPeriod(next)
            setZoom(1)
          }}
          onShapeChange={setShape}
          onZoomChange={setZoom}
          onReset={() => {
            setPeriod("1m")
            setShape("line")
            setZoom(1)
          }}
        />
      </CardHeader>
      <CardContent className="space-y-3">
        {points.length ? (
          <figure>
            {/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Inline SVG needs image semantics to expose its title and description. */}
            <svg
              viewBox="0 0 720 260"
              role="img"
              aria-labelledby={`${id}-title ${id}-description`}
              className="w-full text-primary"
            >
              <title id={`${id}-title`}>
                {name} 예시 시계열 ({unit})
              </title>
              <desc id={`${id}-description`}>
                {points[0].date}부터 {points.at(-1)?.date}까지 {points.length}개 예시 값. 최솟값{" "}
                {min.toLocaleString("ko-KR")}, 최댓값 {max.toLocaleString("ko-KR")}. 실선은 지수,
                점선은 범위 기준선입니다. 아래 데이터 표에서도 확인할 수 있습니다.
              </desc>
              {[low, (low + high) / 2, high].map((tick, index) => (
                <g key={tick}>
                  <line
                    x1="65"
                    x2="680"
                    y1={220 - index * 95}
                    y2={220 - index * 95}
                    stroke="var(--border)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="58"
                    y={224 - index * 95}
                    textAnchor="end"
                    fill="var(--muted-foreground)"
                    fontSize="11"
                  >
                    {tick.toFixed(0)}
                  </text>
                </g>
              ))}
              {shape === "area" && last && (
                <path
                  d={`${path} L${last.x},220 L65,220 Z`}
                  fill="currentColor"
                  fillOpacity="0.12"
                />
              )}
              <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {coordinates.length === 1 && (
                <circle cx={coordinates[0].x} cy={coordinates[0].y} r="4" fill="currentColor" />
              )}
              <text x="65" y="246" fill="var(--muted-foreground)" fontSize="11">
                {points[0].date}
              </text>
              <text x="680" y="246" textAnchor="end" fill="var(--muted-foreground)" fontSize="11">
                {points.at(-1)?.date}
              </text>
            </svg>
            {/* oxlint-enable jsx-a11y/prefer-tag-over-role */}
            <figcaption className="text-xs text-muted-foreground">
              정적 예시 · 실선: 지수 ({unit}) / 점선: 범위 기준 · 확대는 최근 데이터 구간을
              표시합니다.
            </figcaption>
            <details className="mt-3">
              <summary className="cursor-pointer rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-ring">
                표로 데이터 보기 ({points.length}개)
              </summary>
              <div className="mt-2 max-h-60 overflow-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">{name} 표시 구간의 예시 값</caption>
                  <thead>
                    <tr>
                      <th scope="col">날짜</th>
                      <th scope="col">값 ({unit})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((point) => (
                      <tr key={point.date}>
                        <th scope="row" className="py-1 font-normal">
                          {point.date}
                        </th>
                        <td>{point.value.toLocaleString("ko-KR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </figure>
        ) : (
          <output className="block p-8 text-center text-muted-foreground">
            선택한 기간의 예시 데이터가 없습니다.
          </output>
        )}
        <p className="text-xs text-muted-foreground">
          실제 시세나 투자 예측이 아닌 디자인 확인용 그래프입니다.
        </p>
      </CardContent>
    </Card>
  )
}
