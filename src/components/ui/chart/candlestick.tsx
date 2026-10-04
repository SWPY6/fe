"use client"

import {
  RoundedCandleSeries,
  type RoundedCandleData,
  type RoundedCandleSeriesOptions,
} from "@tradingview/lwc-plugin-rounded-candles-series"
import type { DeepPartial, ISeriesApi, Time, WhitespaceData } from "lightweight-charts"
import { use, useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react"

import { ChartContext } from "./chart-context"
import { resolveCssColors } from "./color"

export type CandlestickData = RoundedCandleData | WhitespaceData<Time>
export type CandlestickOptions = DeepPartial<RoundedCandleSeriesOptions>
export type CandlestickApi = ISeriesApi<"Custom", Time, CandlestickData, RoundedCandleSeriesOptions>

export type CandlestickProps = {
  ref?: Ref<CandlestickApi | null>
  data: CandlestickData[]
  options?: CandlestickOptions
}

export function Candlestick({ ref, data, options }: CandlestickProps) {
  const context = use(ChartContext)
  const initialData = useRef(data)
  const initialOptions = useRef(options)
  const [series, setSeries] = useState<CandlestickApi | null>(null)

  useLayoutEffect(
    function createCandlestickSeries() {
      if (!context) return

      const nextSeries = context.chart.addCustomSeries(
        new RoundedCandleSeries(),
        resolveCssColors(context.root, initialOptions.current),
      )
      nextSeries.setData(initialData.current)
      setSeries(nextSeries)

      return () => {
        // oxlint-disable-next-line react/exhaustive-deps -- Read the latest liveness state during cleanup.
        if (context.alive.current) {
          context.chart.removeSeries(nextSeries)
        }
      }
    },
    [context],
  )

  useLayoutEffect(
    function updateCandlestickData() {
      series?.setData(data)
    },
    [data, series],
  )

  useLayoutEffect(
    function updateCandlestickOptions() {
      if (context && series && options) {
        series.applyOptions(resolveCssColors(context.root, options))
      }
    },
    [context, options, series],
  )

  useImperativeHandle<CandlestickApi | null, CandlestickApi | null>(ref, () => series, [series])

  if (!context) {
    throw new Error("Candlestick must be rendered inside Chart.")
  }

  return null
}
