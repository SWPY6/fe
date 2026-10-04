import {
  Candlestick,
  Chart,
  Line,
  type CandlestickOptions,
  type CandlestickProps,
  type ChartApi,
  type ChartProps,
  type LineProps,
} from "@/components/ui/chart"

const chartOptions = {
  layout: {
    background: { color: "var(--background)" },
    textColor: "var(--muted-foreground)",
  },
  localization: { locale: "ko-KR" },
  grid: {
    vertLines: { visible: false },
    horzLines: { color: "var(--border)" },
  },
  rightPriceScale: { borderVisible: false },
  timeScale: { borderVisible: false },
} satisfies NonNullable<ChartProps["options"]>

const candlestickOptions = {
  upColor: "var(--positive)",
  downColor: "var(--negative)",
  wickUpColor: "var(--positive)",
  wickDownColor: "var(--negative)",
  borderVisible: false,
  radius: 3,
} satisfies CandlestickOptions

function fitContent(chart: ChartApi | null) {
  chart?.timeScale().fitContent()
}

type StockChartProps = {
  view: "line" | "candlestick"
  candlestickData: CandlestickProps["data"]
  lineData: LineProps["data"]
  className?: string
}

export function StockChart({ view, candlestickData, lineData, className }: StockChartProps) {
  return (
    <Chart
      ref={fitContent}
      className={className}
      aria-label={view === "line" ? "종가 라인 차트" : "가격 캔들 차트"}
      options={chartOptions}
    >
      {view === "line" ? (
        <Line data={lineData} options={{ color: "var(--primary)", lineWidth: 2 }} />
      ) : (
        <Candlestick data={candlestickData} options={candlestickOptions} />
      )}
    </Chart>
  )
}
