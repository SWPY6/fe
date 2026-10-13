import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { IChartApi, LogicalRange } from "lightweight-charts"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useDebouncedCallback } from "react-simplikit"

import { getChart1QueryOptions } from "@/api/generated/api"
import { TradingChart } from "@/components/ui/chart"

const chartIndicators = ["KOSPI", "KOSDAQ", "NASDAQ", "SP500", "USD_KRW"] as const
type ChartIndicator = (typeof chartIndicators)[number]
const chartMessageClassName =
  "mt-5 flex h-44 items-center justify-center typo-helper text-muted-foreground"
const dayInMilliseconds = 24 * 60 * 60 * 1000
type ChartInterval = "1D" | "1W" | "1M"
type ChartRequest = { from: string; interval: ChartInterval } | undefined
type ChartCandle = { tradeAt: string; close: number }
type PendingView = "fit" | { from: string; to: string }

export function isChartIndicator(value: string | undefined): value is ChartIndicator {
  return chartIndicators.some((indicator) => indicator === value)
}

function earliestAllowedDate() {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(date.getUTCFullYear() - 5)
  date.setUTCDate(date.getUTCDate() + 2)
  return date.getTime()
}

function dateString(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10)
}

function dateAtLogical(candles: ChartCandle[], logical: number) {
  const first = Date.parse(candles[0].tradeAt)
  const lastIndex = candles.length - 1
  const last = Date.parse(candles[lastIndex].tradeAt)
  const averageStep = Math.max(dayInMilliseconds, (last - first) / Math.max(1, lastIndex))

  if (logical <= 0) return first + logical * averageStep
  if (logical >= lastIndex) return last + (logical - lastIndex) * averageStep

  const before = Math.floor(logical)
  const after = before + 1
  const start = Date.parse(candles[before].tradeAt)
  const end = Date.parse(candles[after].tradeAt)
  return start + (end - start) * (logical - before)
}

function intervalForSpan(days: number, current: ChartInterval): ChartInterval {
  if (current === "1D" && days <= 150) return "1D"
  if (current === "1W" && days >= 75 && days <= 900) return "1W"
  if (current === "1M" && days >= 480) return "1M"
  if (days < 100) return "1D"
  if (days < 730) return "1W"
  return "1M"
}

function requestForVisibleRange(
  logical: LogicalRange,
  candles: ChartCandle[],
  current: ChartRequest,
) {
  const first = Date.parse(candles[0].tradeAt)
  const last = Date.parse(candles[candles.length - 1].tradeAt)
  const to = Math.min(last, dateAtLogical(candles, logical.to))
  const from = Math.min(to - dayInMilliseconds, dateAtLogical(candles, logical.from))
  const spanDays = Math.max(1, (to - from) / dayInMilliseconds)
  const currentInterval = current?.interval ?? "1D"
  const interval = intervalForSpan(spanDays, currentInterval)
  const requestFrom = Math.max(
    earliestAllowedDate(),
    from - Math.max(30, spanDays / 2) * dayInMilliseconds,
  )
  const currentFrom = current?.from ? Date.parse(current.from) : first
  const needsHistory = logical.from < -2 && requestFrom < currentFrom - 7 * dayInMilliseconds

  if (!needsHistory && interval === currentInterval) return null

  return {
    params: { from: dateString(requestFrom), interval },
    visible: { from: dateString(Math.max(from, earliestAllowedDate())), to: dateString(to) },
  }
}

export function MarketIndicatorChart({ indicator }: { indicator: ChartIndicator }) {
  return <IndicatorChart key={indicator} indicator={indicator} />
}

function IndicatorChart({ indicator }: { indicator: ChartIndicator }) {
  const [params, setParams] = useState<ChartRequest>(undefined)
  const [chart, setChart] = useState<IChartApi | null>(null)
  const pendingView = useRef<PendingView | null>("fit")
  const restoringView = useRef(false)
  const updateChart = useCallback((next: IChartApi | null) => {
    if (next && !pendingView.current) pendingView.current = "fit"
    setChart(next)
  }, [])
  const query = useQuery(
    getChart1QueryOptions(indicator, params, {
      query: { refetchInterval: 10_000, placeholderData: keepPreviousData },
    }),
  )
  const candles = query.data?.data.candles
  const lineData = useMemo(
    () => candles?.map(({ tradeAt, close }) => ({ time: tradeAt, value: close })) ?? [],
    [candles],
  )

  const onVisibleRangeChange = useDebouncedCallback<LogicalRange>({
    timeThreshold: 300,
    onChange: (logical) => {
      if (
        !candles?.length ||
        query.isPlaceholderData ||
        pendingView.current ||
        restoringView.current
      ) {
        return
      }
      const next = requestForVisibleRange(logical, candles, params)
      if (!next) return
      pendingView.current = next.visible
      setParams(next.params)
    },
  })

  useEffect(
    function subscribeVisibleRange() {
      if (!chart) return
      const timeScale = chart.timeScale()
      const onRange = (logical: LogicalRange | null) => {
        if (logical && !restoringView.current && !pendingView.current) {
          onVisibleRangeChange(logical)
        }
      }
      timeScale.subscribeVisibleLogicalRangeChange(onRange)
      return () => timeScale.unsubscribeVisibleLogicalRangeChange(onRange)
    },
    [chart, onVisibleRangeChange],
  )

  useLayoutEffect(() => {
    if (!chart || !candles?.length || query.isPlaceholderData || !pendingView.current) return
    const frame = requestAnimationFrame(() => {
      const view = pendingView.current
      if (!view) return
      pendingView.current = null
      restoringView.current = true
      if (view === "fit") chart.timeScale().fitContent()
      else chart.timeScale().setVisibleRange(view)
      requestAnimationFrame(() => {
        restoringView.current = false
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [chart, candles, query.isPlaceholderData])

  return (
    <div>
      {query.isPending ? (
        <p className={chartMessageClassName}>차트를 불러오는 중입니다.</p>
      ) : query.isError ? (
        <p role="alert" className={chartMessageClassName}>
          차트를 불러오지 못했습니다.
        </p>
      ) : !Array.isArray(candles) ? (
        <p role="alert" className={chartMessageClassName}>
          차트 데이터가 빠졌습니다.
        </p>
      ) : candles.length === 0 ? (
        <p className={chartMessageClassName}>선택한 기간의 차트 자료가 없습니다.</p>
      ) : (
        <TradingChart.Root
          ref={updateChart}
          options={{ timeScale: { fixLeftEdge: false } }}
          className="mt-5 h-44 w-full"
          aria-label={`${indicator} 선 그래프`}
        >
          <TradingChart.Line data={lineData} />
        </TradingChart.Root>
      )}
    </div>
  )
}
