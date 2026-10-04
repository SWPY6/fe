"use client"

import { cn } from "cn"
import { isEqual } from "es-toolkit"
import {
  createChart,
  type ChartOptions,
  type DeepPartial,
  type IChartApi,
  type MouseEventHandler,
  type Time,
} from "lightweight-charts"
import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type Ref,
} from "react"
import { usePreservedReference, useRefEffect } from "react-simplikit"

import { Tooltip } from "../tooltip"
import { resolveCssColors } from "./color"
import { TradingChartProvider, type TradingChartContextValue } from "./context"

const defaultOptions = {
  autoSize: true,
  layout: {
    background: { color: "var(--background)" },
    textColor: "var(--muted-foreground)",
  },
  grid: {
    vertLines: { visible: false },
    horzLines: { color: "var(--border)" },
  },
  rightPriceScale: { borderVisible: false },
  timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
} satisfies DeepPartial<ChartOptions>

export type TradingChartRootProps = Omit<ComponentProps<"div">, "onClick" | "ref"> & {
  ref?: Ref<IChartApi | null>
  options?: DeepPartial<ChartOptions>
  onClick?: MouseEventHandler<Time>
  onCrosshairMove?: MouseEventHandler<Time>
}

export function TradingChartRoot({
  ref,
  className,
  options,
  children,
  onClick,
  onCrosshairMove,
  ...props
}: TradingChartRootProps) {
  const [context, setContext] = useState<TradingChartContextValue | null>(null)
  const initialOptions = useRef(options)
  const stableOptions = usePreservedReference(options ?? {}, isEqual)
  const containerRef = useRefEffect<HTMLDivElement>(function createTradingChart(container) {
    const chart = createChart(container, resolveCssColors(container, defaultOptions))
    if (initialOptions.current) {
      chart.applyOptions(resolveCssColors(container, initialOptions.current))
    }
    const lifecycle = { removed: false }
    setContext({ chart, container, lifecycle })

    return () => {
      lifecycle.removed = true
      chart.remove()
    }
  }, [])

  useLayoutEffect(
    function updateOptions() {
      if (context && !context.lifecycle.removed) {
        context.chart.applyOptions(resolveCssColors(context.container, stableOptions))
      }
    },
    [context, stableOptions],
  )

  useLayoutEffect(
    function subscribeClick() {
      if (!context || !onClick || context.lifecycle.removed) return
      context.chart.subscribeClick(onClick)
      return () => {
        if (!context.lifecycle.removed) context.chart.unsubscribeClick(onClick)
      }
    },
    [context, onClick],
  )

  useLayoutEffect(
    function subscribeCrosshairMove() {
      if (!context || !onCrosshairMove || context.lifecycle.removed) return
      context.chart.subscribeCrosshairMove(onCrosshairMove)
      return () => {
        if (!context.lifecycle.removed) context.chart.unsubscribeCrosshairMove(onCrosshairMove)
      }
    },
    [context, onCrosshairMove],
  )

  useImperativeHandle<IChartApi | null, IChartApi | null>(ref, () => context?.chart ?? null, [
    context,
  ])

  return (
    <div
      ref={containerRef}
      data-slot="trading-chart"
      className={cn("relative", className)}
      {...props}
    >
      {context ? (
        <TradingChartProvider {...context}>
          <Tooltip.Provider>{children}</Tooltip.Provider>
        </TradingChartProvider>
      ) : null}
    </div>
  )
}
