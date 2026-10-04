"use client"

import { cn } from "cn"
import type { MouseEventParams, Time } from "lightweight-charts"
import { useLayoutEffect, useState, type ComponentProps, type ReactNode } from "react"

import { Tooltip } from "../tooltip"
import { useTradingChart, useTradingSeries } from "./context"

export type TradingChartTooltipProps = Omit<ComponentProps<typeof Tooltip.Content>, "children"> & {
  children: (event: MouseEventParams<Time>) => ReactNode
}

export function TradingChartTooltip({
  children,
  className,
  side = "top",
  sideOffset = 12,
  ...props
}: TradingChartTooltipProps) {
  const { chart, container, lifecycle } = useTradingChart()
  const { series } = useTradingSeries()
  const [hover, setHover] = useState<MouseEventParams<Time> | null>(null)

  useLayoutEffect(
    function subscribeHover() {
      if (lifecycle.removed) return

      function handleCrosshairMove(event: MouseEventParams<Time>) {
        const { point, paneIndex } = event
        if (lifecycle.removed || !point || !event.seriesData.has(series)) {
          setHover(null)
          return
        }

        const pane = series.getPane()
        const size = chart.paneSize(pane.paneIndex())
        if (
          point.x < 0 ||
          point.y < 0 ||
          point.x >= size.width ||
          point.y >= size.height ||
          paneIndex !== pane.paneIndex() ||
          !series.options().visible
        ) {
          setHover(null)
          return
        }
        setHover(event)
      }

      function clearHover() {
        setHover(null)
      }

      chart.subscribeCrosshairMove(handleCrosshairMove)
      container.addEventListener("pointerleave", clearHover)
      return () => {
        container.removeEventListener("pointerleave", clearHover)
        if (!lifecycle.removed) chart.unsubscribeCrosshairMove(handleCrosshairMove)
      }
    },
    [chart, container, lifecycle, series],
  )

  const pane = hover ? series.getPane() : null
  const paneBounds = pane?.getHTMLElement()?.getBoundingClientRect()
  const containerBounds = container.getBoundingClientRect()
  const leftAxisWidth = pane ? pane.priceScale("left").width() : 0
  const left =
    (hover?.point?.x ?? 0) +
    (paneBounds?.left ?? containerBounds.left) -
    containerBounds.left +
    leftAxisWidth -
    container.clientLeft
  const top =
    (hover?.point?.y ?? 0) +
    (paneBounds?.top ?? containerBounds.top) -
    containerBounds.top -
    container.clientTop

  return (
    <Tooltip.Root
      open={hover !== null}
      onOpenChange={(open) => {
        if (!open) setHover(null)
      }}
      disableHoverableContent
    >
      <Tooltip.Trigger asChild>
        <span
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none absolute size-px"
          style={{ left, top }}
        />
      </Tooltip.Trigger>
      <Tooltip.Content
        {...props}
        side={side}
        sideOffset={sideOffset}
        updatePositionStrategy="always"
        className={cn("pointer-events-none", className)}
      >
        {hover ? children(hover) : null}
      </Tooltip.Content>
    </Tooltip.Root>
  )
}
