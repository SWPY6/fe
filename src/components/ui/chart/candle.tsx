"use client"

import {
  RoundedCandleSeries,
  type RoundedCandleData,
  type RoundedCandleSeriesOptions,
} from "@tradingview/lwc-plugin-rounded-candles-series"
import { isEqual } from "es-toolkit"
import type { DeepPartial, ISeriesApi, Time, WhitespaceData } from "lightweight-charts"
import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react"
import { usePreservedReference } from "react-simplikit"

import { resolveCssColors } from "./color"
import { TradingSeriesProvider, useTradingChart } from "./context"

export type TradingChartCandleProps = {
  ref?: Ref<ISeriesApi<
    "Custom",
    Time,
    RoundedCandleData | WhitespaceData,
    RoundedCandleSeriesOptions,
    DeepPartial<RoundedCandleSeriesOptions>
  > | null>
  data: (RoundedCandleData | WhitespaceData)[]
  options?: DeepPartial<RoundedCandleSeriesOptions>
  children?: ReactNode
}

const defaultOptions = {
  upColor: "var(--positive)",
  downColor: "var(--negative)",
  wickUpColor: "var(--positive)",
  wickDownColor: "var(--negative)",
  borderVisible: false,
  radius: 3,
} satisfies DeepPartial<RoundedCandleSeriesOptions>

export function TradingChartCandle({ ref, data, options, children }: TradingChartCandleProps) {
  const { chart, container, lifecycle } = useTradingChart()
  const [series, setSeries] = useState<ISeriesApi<
    "Custom",
    Time,
    RoundedCandleData | WhitespaceData,
    RoundedCandleSeriesOptions,
    DeepPartial<RoundedCandleSeriesOptions>
  > | null>(null)
  const initial = useRef({ data, options })
  const stableOptions = usePreservedReference(options ?? {}, isEqual)

  useLayoutEffect(
    function createCandle() {
      if (lifecycle.removed) return
      const candle = chart.addCustomSeries(
        new RoundedCandleSeries(),
        resolveCssColors(container, { ...defaultOptions, ...initial.current.options }),
      )
      candle.setData(initial.current.data)
      setSeries(candle)

      return () => {
        if (!lifecycle.removed) chart.removeSeries(candle)
      }
    },
    [chart, container, lifecycle],
  )

  useLayoutEffect(
    function updateData() {
      if (!lifecycle.removed) series?.setData(data)
    },
    [data, series, lifecycle],
  )

  useLayoutEffect(
    function updateOptions() {
      if (!lifecycle.removed) series?.applyOptions(resolveCssColors(container, stableOptions))
    },
    [container, series, stableOptions, lifecycle],
  )

  useImperativeHandle<typeof series, typeof series>(ref, () => series, [series])

  return series ? <TradingSeriesProvider series={series}>{children}</TradingSeriesProvider> : null
}
