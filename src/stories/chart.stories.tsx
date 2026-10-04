import type { Meta, StoryObj } from "@storybook/react-vite"
import type { RoundedCandleData } from "@tradingview/lwc-plugin-rounded-candles-series"
import type { IChartApi } from "lightweight-charts"
import { useState, type ComponentProps } from "react"

import { Button } from "../components/ui/button"
import { TradingChart } from "../components/ui/chart"

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
] satisfies RoundedCandleData[]
const points = candles.map(({ time, close }) => ({ time, value: close }))

function fitContent(chart: IChartApi | null) {
  chart?.timeScale().fitContent()
}

const meta = {
  title: "Components/TradingChart",
  component: TradingChart.Root,
  parameters: {
    layout: "padded",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "TradingChart.Root 안에 Line과 Candle을 조합합니다. Tooltip은 해당 Series 아래에 배치하고, children 함수에서 hover 정보와 외부 데이터를 사용해 내용을 구성합니다.",
      },
    },
  },
  args: { className: "h-80 w-full", ref: fitContent },
} satisfies Meta<typeof TradingChart.Root>

export default meta
type Story = StoryObj<typeof meta>

export const LineChart: Story = {
  name: "Line",
  render: (args) => (
    <TradingChart.Root {...args}>
      <TradingChart.Line data={points} />
    </TradingChart.Root>
  ),
}

function CandleExample(props: ComponentProps<typeof TradingChart.Root>) {
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
      <TradingChart.Root {...props}>
        <TradingChart.Candle data={candles} options={{ radius }} />
      </TradingChart.Root>
    </div>
  )
}

export const CandleChart: Story = {
  name: "Candle · radius 옵션",
  render: (args) => <CandleExample {...args} />,
}

export const Composed: Story = {
  name: "Candle + Line",
  render: (args) => (
    <TradingChart.Root {...args}>
      <TradingChart.Candle data={candles} />
      <TradingChart.Line data={points} options={{ priceLineVisible: false }} />
    </TradingChart.Root>
  ),
}

export const LineWithTooltip: Story = {
  name: "Line · Tooltip",
  render: (args) => (
    <TradingChart.Root {...args}>
      <TradingChart.Line data={points}>
        <TradingChart.Tooltip>
          {({ time }) => {
            const point = points.find((item) => item.time === time)
            if (!point) return null

            return (
              <div className="grid gap-1 tabular-nums">
                <span>{point.time}</span>
                <span>Value: {point.value}</span>
              </div>
            )
          }}
        </TradingChart.Tooltip>
      </TradingChart.Line>
    </TradingChart.Root>
  ),
}

export const CandleWithTooltip: Story = {
  name: "Candle · Tooltip",
  render: (args) => (
    <TradingChart.Root {...args}>
      <TradingChart.Candle data={candles}>
        <TradingChart.Tooltip>
          {({ time }) => {
            const candle = candles.find((item) => item.time === time)
            if (!candle) return null

            return (
              <div className="grid gap-2 tabular-nums">
                <span>{candle.time}</span>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <dt>Open</dt>
                  <dd className="text-right">{candle.open}</dd>
                  <dt>High</dt>
                  <dd className="text-right">{candle.high}</dd>
                  <dt>Low</dt>
                  <dd className="text-right">{candle.low}</dd>
                  <dt>Close</dt>
                  <dd className="text-right">{candle.close}</dd>
                </dl>
              </div>
            )
          }}
        </TradingChart.Tooltip>
      </TradingChart.Candle>
    </TradingChart.Root>
  ),
}

function SwitchableExample(props: ComponentProps<typeof TradingChart.Root>) {
  const [view, setView] = useState<"line" | "candle">("line")

  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <Button
          variant={view === "line" ? "default" : "outline"}
          aria-pressed={view === "line"}
          onClick={() => setView("line")}
        >
          Line
        </Button>
        <Button
          variant={view === "candle" ? "default" : "outline"}
          aria-pressed={view === "candle"}
          onClick={() => setView("candle")}
        >
          Candle
        </Button>
      </div>
      <TradingChart.Root {...props}>
        {view === "line" ? (
          <TradingChart.Line data={points} />
        ) : (
          <TradingChart.Candle data={candles} />
        )}
      </TradingChart.Root>
    </div>
  )
}

export const Switchable: Story = {
  name: "Line · Candle 전환",
  render: (args) => <SwitchableExample {...args} />,
}
