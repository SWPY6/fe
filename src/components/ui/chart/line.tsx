"use client"

import { isEqual } from "es-toolkit"
import {
  LineSeries,
  type ISeriesApi,
  type LineData,
  type LineSeriesPartialOptions,
  type WhitespaceData,
} from "lightweight-charts"
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

export type TradingChartLineProps = {
  ref?: Ref<ISeriesApi<"Line"> | null>
  data: (LineData | WhitespaceData)[]
  options?: LineSeriesPartialOptions
  children?: ReactNode
}

const defaultOptions = { color: "var(--primary)", lineWidth: 2 } satisfies LineSeriesPartialOptions

export function TradingChartLine({ ref, data, options, children }: TradingChartLineProps) {
  const { chart, container, lifecycle } = useTradingChart()
  const [series, setSeries] = useState<ISeriesApi<"Line"> | null>(null)
  const initial = useRef({ data, options })
  const stableOptions = usePreservedReference(options ?? {}, isEqual)

  useLayoutEffect(
    function createLine() {
      if (lifecycle.removed) return
      const line = chart.addSeries(
        LineSeries,
        resolveCssColors(container, { ...defaultOptions, ...initial.current.options }),
      )
      line.setData(initial.current.data)
      setSeries(line)

      return () => {
        if (!lifecycle.removed) chart.removeSeries(line)
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
