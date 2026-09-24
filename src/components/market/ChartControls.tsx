import { useId } from "react"
import { Button } from "../ui/Button"

export type ChartPeriod = "1m" | "3m" | "6m" | "1y"
export type ChartShape = "line" | "area"
export type ChartControlsProps = {
  period: ChartPeriod
  shape: ChartShape
  zoom: number
  onPeriodChange: (period: ChartPeriod) => void
  onShapeChange: (shape: ChartShape) => void
  onZoomChange: (zoom: number) => void
  onReset: () => void
}
export function ChartControls({
  period,
  shape,
  zoom,
  onPeriodChange,
  onShapeChange,
  onZoomChange,
  onReset,
}: ChartControlsProps) {
  const id = useId()
  return (
    <div className="flex flex-wrap items-center gap-3">
      <fieldset aria-label="차트 기간" className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
        {(
          [
            { value: "1m", label: "1개월" },
            { value: "3m", label: "3개월" },
            { value: "6m", label: "6개월" },
            { value: "1y", label: "1년" },
          ] as const
        ).map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name={`${id}-period`}
              value={option.value}
              checked={period === option.value}
              onChange={() => onPeriodChange(option.value)}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-10 items-center rounded-lg px-4 py-2 text-sm font-medium peer-checked:bg-card peer-checked:text-primary peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
              {option.label}
            </span>
          </label>
        ))}
      </fieldset>
      <label htmlFor={id} className="flex items-center gap-2 text-sm">
        차트 모양
        <select
          id={id}
          value={shape}
          onChange={(event) => onShapeChange(event.target.value as ChartShape)}
          className="min-h-10 rounded-lg border bg-card px-3 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <option value="line">라인</option>
          <option value="area">영역</option>
        </select>
      </label>
      <fieldset className="flex flex-wrap items-center gap-2" aria-label="차트 확대 및 초기화">
        <Button disabled={zoom >= 4} onClick={() => onZoomChange(Math.min(4, zoom + 1))}>
          확대
        </Button>
        <Button disabled={zoom <= 1} onClick={() => onZoomChange(Math.max(1, zoom - 1))}>
          축소
        </Button>
        <Button onClick={onReset}>초기화</Button>
        <span className="text-xs text-muted-foreground">{zoom}배 · 최근 구간</span>
      </fieldset>
    </div>
  )
}
