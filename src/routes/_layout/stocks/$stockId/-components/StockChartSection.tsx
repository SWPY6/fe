import { ErrorBoundary } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { BoneSuspense } from "boneyard-js/react"
import type { IChartApi } from "lightweight-charts"
import { Fragment, useState } from "react"

import { getChartSuspenseQueryOptions, getQuoteSuspenseQueryOptions } from "@/api/generated/api"
import { PriceNumber } from "@/components/domain/PriceNumber"
import { Button } from "@/components/ui/button"
import { TradingChart } from "@/components/ui/chart"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

import { stockChartIntervalSchema } from "../-schema"

const route = getRouteApi("/_layout/stocks/$stockId/")

function fitContent(chart: IChartApi | null) {
  chart?.timeScale().fitContent()
}

export function StockChartSection() {
  const { stockId } = route.useParams()
  const { from, to, interval } = route.useSearch()
  const navigate = route.useNavigate()
  const [chartView, setChartView] = useState<"line" | "candlestick">("line")

  return (
    <section aria-labelledby="stock-chart-title" className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="stock-chart-title" className="typo-section-heading">
          차트 및 주요 지표
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select.Root
            value={chartView}
            onValueChange={(value) => {
              if (value === "line" || value === "candlestick") setChartView(value)
            }}
          >
            <Select.Trigger aria-label="차트 유형">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="candlestick">캔들</Select.Item>
              <Select.Item value="line">라인</Select.Item>
            </Select.Content>
          </Select.Root>
          <fieldset className="inline-flex rounded-md bg-accent p-1">
            <legend className="sr-only">차트 기간</legend>
            {[1, 3, 6, 12].map((months) => (
              <Button
                key={months}
                size="sm"
                variant="ghost"
                onClick={() => {
                  const end = new Date()
                  const start = new Date(end)
                  const day = start.getUTCDate()
                  start.setUTCDate(1)
                  start.setUTCMonth(start.getUTCMonth() - months)
                  const lastDay = new Date(
                    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
                  ).getUTCDate()
                  start.setUTCDate(Math.min(day, lastDay))
                  navigate({
                    search: (previous) => ({
                      ...previous,
                      from: start.toISOString().slice(0, 10),
                      to: end.toISOString().slice(0, 10),
                    }),
                    replace: true,
                    resetScroll: false,
                  })
                }}
              >
                {months === 12 ? "1년" : `${months}개월`}
              </Button>
            ))}
          </fieldset>
          <Select.Root
            value={interval}
            onValueChange={(value) => {
              const nextInterval = stockChartIntervalSchema.parse(value)
              navigate({
                search: (previous) => ({ ...previous, interval: nextInterval }),
                replace: true,
                resetScroll: false,
              })
            }}
          >
            <Select.Trigger aria-label="봉 단위">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {stockChartIntervalSchema.options.map((value) => (
                <Select.Item key={value} value={value}>
                  {{ "1D": "일", "1W": "주", "1M": "월", "3M": "분기", "1Y": "년" }[value]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="h-96 min-w-0">
          <ErrorBoundary
            key={`${stockId}-${from}-${to}-${interval}`}
            fallback="오류가 발생했습니다"
          >
            <BoneSuspense className="h-full *:h-full" select="viewport">
              <SuspenseQuery
                {...getChartSuspenseQueryOptions(Number(stockId), { from, to, interval })}
              >
                {({ data: response }) => {
                  const candles = response.data.candles
                  const candlestickData = candles.map(({ tradeAt, open, high, low, close }) => ({
                    time: tradeAt,
                    open,
                    high,
                    low,
                    close,
                  }))
                  const lineData = candles.map(({ tradeAt, close }) => ({
                    time: tradeAt,
                    value: close,
                  }))
                  const hasData = candles.length > 0

                  return hasData ? (
                    <TradingChart.Root
                      ref={fitContent}
                      className="size-full"
                      aria-label={chartView === "line" ? "라인 차트" : "캔들 차트"}
                      options={{ localization: { locale: "ko-KR" } }}
                    >
                      {chartView === "line" ? (
                        <TradingChart.Line data={lineData}>
                          <TradingChart.Tooltip>
                            {({ time }) => {
                              const candle = candles.find((item) => item.tradeAt === time)
                              if (!candle) return null

                              return (
                                <div className="grid gap-2">
                                  <div className="flex items-center justify-between gap-4">
                                    <time dateTime={candle.tradeAt}>{candle.tradeAt}</time>
                                    <span>{response.data.currency}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span>종가</span>
                                    <PriceNumber
                                      value={candle.close}
                                      className="text-inherit"
                                      format={{ maximumFractionDigits: 2 }}
                                    />
                                  </div>
                                </div>
                              )
                            }}
                          </TradingChart.Tooltip>
                        </TradingChart.Line>
                      ) : (
                        <TradingChart.Candle data={candlestickData}>
                          <TradingChart.Tooltip>
                            {({ time }) => {
                              const candle = candles.find((item) => item.tradeAt === time)
                              if (!candle) return null

                              return (
                                <div className="grid gap-2">
                                  <div className="flex items-center justify-between gap-4">
                                    <time dateTime={candle.tradeAt}>{candle.tradeAt}</time>
                                    <span>{response.data.currency}</span>
                                  </div>
                                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    {[
                                      { label: "시가", value: candle.open },
                                      { label: "고가", value: candle.high },
                                      { label: "저가", value: candle.low },
                                      { label: "종가", value: candle.close },
                                    ].map(({ label, value }) => (
                                      <Fragment key={label}>
                                        <dt>{label}</dt>
                                        <dd className="text-right">
                                          <PriceNumber
                                            value={value}
                                            className="text-inherit"
                                            format={{ maximumFractionDigits: 2 }}
                                          />
                                        </dd>
                                      </Fragment>
                                    ))}
                                  </dl>
                                </div>
                              )
                            }}
                          </TradingChart.Tooltip>
                        </TradingChart.Candle>
                      )}
                    </TradingChart.Root>
                  ) : (
                    <p className="flex h-full items-center justify-center typo-body-sm text-muted-foreground">
                      선택한 기간의 차트 데이터가 없습니다. 조건을 변경해주세요.
                    </p>
                  )
                }}
              </SuspenseQuery>
            </BoneSuspense>
          </ErrorBoundary>
        </div>
        <ErrorBoundary key={`indicators-${stockId}`} fallback="오류가 발생했습니다">
          <BoneSuspense select="viewport">
            <SuspenseQuery {...getQuoteSuspenseQueryOptions(Number(stockId))}>
              {({ data: response }) => (
                <dl>
                  {[
                    {
                      label: "전일 종가",
                      value: response.data.indicators?.previousClose,
                      currency: response.data.currency,
                    },
                    {
                      label: "시가",
                      value: response.data.indicators?.open,
                      currency: response.data.currency,
                    },
                    {
                      label: "고가",
                      value: response.data.indicators?.high,
                      currency: response.data.currency,
                    },
                    {
                      label: "저가",
                      value: response.data.indicators?.low,
                      currency: response.data.currency,
                    },
                    { label: "거래량(주)", value: response.data.indicators?.volume },
                    {
                      label: "평소 거래량 대비(배)",
                      value: response.data.indicators?.volumeRatio20d,
                    },
                    {
                      label: "시가총액",
                      value: response.data.indicators?.marketCap,
                      currency: response.data.currency,
                    },
                    {
                      label: "거래대금",
                      value: response.data.indicators?.tradingValue,
                      currency: response.data.currency,
                    },
                  ].map((metric) => (
                    <Fragment key={metric.label}>
                      <div className="flex items-center justify-between gap-3 py-4 typo-body-sm">
                        <dt className="text-muted-foreground">{metric.label}</dt>
                        <dd className="text-right">
                          {metric.value == null ? (
                            "—"
                          ) : (
                            <>
                              <PriceNumber
                                value={metric.value}
                                className="text-foreground"
                                format={{
                                  notation: metric.currency ? "compact" : "standard",
                                }}
                              />{" "}
                              {metric.currency}
                            </>
                          )}
                        </dd>
                      </div>
                      <Separator />
                    </Fragment>
                  ))}
                </dl>
              )}
            </SuspenseQuery>
          </BoneSuspense>
        </ErrorBoundary>
      </div>
    </section>
  )
}
