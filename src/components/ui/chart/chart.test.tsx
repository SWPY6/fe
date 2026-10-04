import type { IChartApi, LineData } from "lightweight-charts"
import { createRef, StrictMode } from "react"
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "vitest-browser-react"
import { page } from "vitest/browser"

import "@/index.css"

import { TradingChart } from "."

const points = [
  { time: "2024-01-02", value: 100 },
  { time: "2024-01-03", value: 105 },
  { time: "2024-01-04", value: 98 },
  { time: "2024-01-05", value: 112 },
] satisfies LineData[]

const candles = points.map(({ time, value }) => ({
  time,
  open: value - 4,
  high: value + 2,
  low: value - 6,
  close: value,
}))

function hasRedPixel(container: HTMLElement, x: number, y: number) {
  return Array.from(container.querySelectorAll("canvas")).some((canvas) => {
    const context = canvas.getContext("2d", { willReadFrequently: true })
    if (!context) return false
    const scale = canvas.width / canvas.getBoundingClientRect().width
    const pixels = context.getImageData(
      Math.round((x - 3) * scale),
      Math.round((y - 3) * scale),
      Math.ceil(6 * scale),
      Math.ceil(6 * scale),
    ).data
    for (let index = 0; index < pixels.length; index += 4) {
      if (
        pixels[index] > 180 &&
        pixels[index + 1] < 90 &&
        pixels[index + 2] < 90 &&
        pixels[index + 3] > 0
      ) {
        return true
      }
    }
    return false
  })
}

describe("TradingChart", () => {
  afterEach(cleanup)

  it.each(["line", "candle"])("renders %s at the supplied data coordinates", async (view) => {
    const chartRef = createRef<IChartApi | null>()
    const screen = await render(
      <StrictMode>
        <TradingChart.Root
          ref={chartRef}
          style={{ height: 240, width: 400 }}
          options={{ rightPriceScale: { visible: false }, timeScale: { visible: false } }}
        >
          {view === "line" ? (
            <TradingChart.Line data={points} options={{ color: "#ef0000", lineWidth: 3 }} />
          ) : (
            <TradingChart.Candle
              data={candles}
              options={{ upColor: "#ef0000", downColor: "#ef0000" }}
            />
          )}
        </TradingChart.Root>
      </StrictMode>,
    )

    await expect
      .poll(() => {
        const chart = chartRef.current
        const series = chart?.panes()[0]?.getSeries()[0]
        if (!chart || !series) return false
        const x = chart.timeScale().timeToCoordinate(points[1].time)
        const y = series.priceToCoordinate(view === "line" ? points[1].value : points[1].value - 2)
        return x !== null && y !== null && hasRedPixel(screen.container, x, y)
      })
      .toBe(true)

    expect(chartRef.current?.panes()[0].getSeries()).toHaveLength(1)
    expect(chartRef.current?.panes()[0].getSeries()[0].data()).toEqual(
      view === "line" ? points : candles,
    )
    await screen.unmount()
    expect(chartRef.current).toBeNull()
    expect(screen.container.querySelector("canvas")).toBeNull()
  })

  it.each(["line", "candle"])(
    "shows caller content on %s hover and closes on leave",
    async (view) => {
      const chartRef = createRef<IChartApi | null>()
      const content = (
        <TradingChart.Tooltip>
          {({ time }) => <span>Selected: {String(time)}</span>}
        </TradingChart.Tooltip>
      )
      const screen = await render(
        <StrictMode>
          <button type="button">Outside chart</button>
          <TradingChart.Root
            ref={chartRef}
            aria-label="Trading chart"
            style={{ height: 240, width: 400 }}
          >
            {view === "line" ? (
              <TradingChart.Line data={points} options={{ lineWidth: 2 }}>
                {content}
              </TradingChart.Line>
            ) : (
              <TradingChart.Candle data={candles} options={{ radius: 3 }}>
                {content}
              </TradingChart.Candle>
            )}
          </TradingChart.Root>
        </StrictMode>,
      )
      await expect
        .poll(() => chartRef.current?.timeScale().timeToCoordinate(points[1].time))
        .toBeTypeOf("number")
      const x = chartRef.current!.timeScale().timeToCoordinate(points[1].time)!
      await screen.getByLabelText("Trading chart").hover({ position: { x, y: 100 } })
      await expect.element(page.getByRole("tooltip")).toHaveTextContent("Selected: 2024-01-03")
      await expect.element(page.getByText("Selected: 2024-01-03").first()).toBeVisible()

      const nextX = chartRef.current!.timeScale().timeToCoordinate(points[2].time)!
      await screen.getByLabelText("Trading chart").hover({ position: { x: nextX, y: 100 } })
      await expect.element(page.getByRole("tooltip")).toHaveTextContent("Selected: 2024-01-04")
      await screen.getByRole("button", { name: "Outside chart" }).hover()
      await expect.element(page.getByRole("tooltip")).not.toBeInTheDocument()
    },
  )
})
