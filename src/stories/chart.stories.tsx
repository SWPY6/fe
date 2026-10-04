import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Button } from "../components/ui/button"
import {
  Candlestick,
  Chart,
  Line,
  type CandlestickOptions,
  type ChartApi,
  type ChartProps,
} from "../components/ui/chart"

const candles = [
  { time: "2026-09-01", open: 100, high: 106, low: 98, close: 104 },
  { time: "2026-09-02", open: 104, high: 109, low: 102, close: 107 },
  { time: "2026-09-03", open: 107, high: 108, low: 99, close: 101 },
  { time: "2026-09-04", open: 101, high: 104, low: 96, close: 98 },
  { time: "2026-09-07", open: 98, high: 105, low: 97, close: 103 },
  { time: "2026-09-08", open: 103, high: 112, low: 102, close: 110 },
  { time: "2026-09-09", open: 110, high: 116, low: 108, close: 114 },
  { time: "2026-09-10", open: 114, high: 115, low: 106, close: 108 },
  { time: "2026-09-11", open: 108, high: 112, low: 105, close: 110 },
  { time: "2026-09-14", open: 110, high: 120, low: 109, close: 118 },
  { time: "2026-09-15", open: 118, high: 122, low: 113, close: 115 },
  { time: "2026-09-16", open: 115, high: 125, low: 114, close: 123 },
]
const points = candles.map(({ time, close }) => ({ time, value: close }))

const chartOptions = {
  layout: { textColor: "var(--muted-foreground)" },
  grid: {
    vertLines: { visible: false },
    horzLines: { color: "var(--border)" },
  },
  rightPriceScale: { borderVisible: false },
  timeScale: { borderVisible: false },
} satisfies NonNullable<ChartProps["options"]>

const candleOptions = {
  upColor: "var(--positive)",
  downColor: "var(--negative)",
  wickUpColor: "var(--positive)",
  wickDownColor: "var(--negative)",
  borderVisible: false,
} satisfies CandlestickOptions

function fitContent(chart: ChartApi | null) {
  chart?.timeScale().fitContent()
}

const meta = {
  title: "Components/Chart",
  component: Chart,
  parameters: {
    layout: "padded",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Chart 안에 Line과 Candlestick을 조합합니다. 각 시리즈는 데이터와 options를 받고, ref로 차트와 시리즈를 직접 제어할 수 있습니다. 예제 데이터는 서버 API와 무관한 고정 데이터입니다.",
      },
    },
  },
  args: { className: "h-80 w-full", options: chartOptions },
} satisfies Meta<typeof Chart>

export default meta
type Story = StoryObj<typeof meta>

export const LineChart: Story = {
  name: "라인",
  render: (args) => (
    <Chart {...args} ref={fitContent}>
      <Line data={points} options={{ color: "var(--primary)", lineWidth: 2 }} />
    </Chart>
  ),
}

function CandlestickExample(props: ChartProps) {
  const [radius, setRadius] = useState(4)

  return (
    <div className="grid gap-4">
      <label className="flex items-center gap-3 typo-label-sm">
        모서리 둥글기: {radius}px
        <input
          type="range"
          min={0}
          max={12}
          value={radius}
          onChange={(event) => setRadius(event.currentTarget.valueAsNumber)}
        />
      </label>
      <Chart {...props} ref={fitContent}>
        <Candlestick data={candles} options={{ ...candleOptions, radius }} />
      </Chart>
    </div>
  )
}

export const CandlestickChart: Story = {
  name: "캔들과 모서리 옵션",
  render: (args) => <CandlestickExample {...args} />,
}

export const Composed: Story = {
  name: "캔들과 라인 조합",
  render: (args) => (
    <Chart {...args} ref={fitContent}>
      <Candlestick data={candles} options={candleOptions} />
      <Line
        data={points}
        options={{ color: "var(--primary)", lineWidth: 2, priceLineVisible: false }}
      />
    </Chart>
  ),
}

function SwitchableExample(props: ChartProps) {
  const [view, setView] = useState<"line" | "candlestick">("candlestick")

  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <Button
          variant={view === "line" ? "default" : "outline"}
          aria-pressed={view === "line"}
          onClick={() => setView("line")}
        >
          라인
        </Button>
        <Button
          variant={view === "candlestick" ? "default" : "outline"}
          aria-pressed={view === "candlestick"}
          onClick={() => setView("candlestick")}
        >
          캔들
        </Button>
      </div>
      <Chart {...props} ref={fitContent}>
        {view === "line" ? (
          <Line data={points} options={{ color: "var(--primary)", lineWidth: 2 }} />
        ) : (
          <Candlestick data={candles} options={candleOptions} />
        )}
      </Chart>
    </div>
  )
}

export const Switchable: Story = {
  name: "라인·캔들 전환",
  render: (args) => <SwitchableExample {...args} />,
}
