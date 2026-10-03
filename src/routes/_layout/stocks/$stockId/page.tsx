import { ErrorBoundary, Suspense } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import { Link, getRouteApi } from "@tanstack/react-router"
import { Fragment } from "react"

import {
  getChartSuspenseQueryOptions,
  getQuoteSuspenseQueryOptions,
  getSummarySuspenseQueryOptions,
} from "@/api/generated/api"
import { PriceNumber } from "@/components/domain/PriceNumber"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

import { StockChart } from "./-components/StockChart"
import { stockChartIntervalSchema } from "./-schema"

const route = getRouteApi("/_layout/stocks/$stockId/")

export function StockPage() {
  const { stockId } = route.useParams()
  const { from, to, interval } = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <main className="py-8">
      <div className="mt-6 flex items-center justify-between gap-4">
        <h1 className="typo-section-heading">종목 상세</h1>
        <Button asChild size="sm" variant="outline">
          <Link to="/movers">다른 종목 찾기</Link>
        </Button>
      </div>
      <Separator className="my-6" />
      <section aria-label="종목 요약 정보" className="flex flex-wrap items-center gap-x-12 gap-y-5">
        <ErrorBoundary key={`identity-${stockId}`} fallback="오류가 발생했습니다">
          <Suspense fallback="로딩중">
            <SuspenseQuery {...getSummarySuspenseQueryOptions(Number(stockId))}>
              {({ data: response }) => (
                <div>
                  <h2 className="typo-subheading">{response.data.profile?.name ?? "—"}</h2>
                  <p className="mt-1 typo-body-sm text-muted-foreground">
                    {response.data.profile?.ticker} · {response.data.market} ·{" "}
                    {response.data.currency}
                  </p>
                </div>
              )}
            </SuspenseQuery>
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary key={`quote-${stockId}`} fallback="오류가 발생했습니다">
          <Suspense fallback="로딩중">
            <SuspenseQuery {...getQuoteSuspenseQueryOptions(Number(stockId))}>
              {({ data: response }) => (
                <div>
                  <p className="typo-numeric-md">
                    {response.data.price == null || !response.data.currency ? (
                      "—"
                    ) : (
                      <>
                        <PriceNumber
                          value={response.data.price}
                          className="text-foreground"
                          format={{ maximumFractionDigits: 2 }}
                        />{" "}
                        {response.data.currency}
                      </>
                    )}
                  </p>
                  <p className="typo-body">
                    {response.data.changeRate == null ? (
                      "—"
                    ) : (
                      <PriceNumber
                        value={response.data.changeRate}
                        format={{ style: "unit", unit: "percent", signDisplay: "exceptZero" }}
                      />
                    )}
                  </p>
                  <p className="mt-2 typo-helper text-muted-foreground">
                    {response.data.priceAt
                      ? new Date(response.data.priceAt).toLocaleString("ko-KR")
                      : "기준 시각 없음"}
                    {response.data.priceTiming === "DELAYED"
                      ? " · 지연 시세"
                      : response.data.priceTiming === "REALTIME"
                        ? " · 실시간 시세"
                        : ""}
                  </p>
                </div>
              )}
            </SuspenseQuery>
          </Suspense>
        </ErrorBoundary>
      </section>
      <Separator className="my-8" />
      <section aria-labelledby="stock-chart-title">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="stock-chart-title" className="typo-section-heading">
            차트 및 주요 지표
          </h2>
          <div className="flex flex-wrap items-center gap-2">
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
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <ErrorBoundary
              key={`${stockId}-${from}-${to}-${interval}`}
              fallback="오류가 발생했습니다"
            >
              <Suspense fallback="로딩중">
                <SuspenseQuery
                  {...getChartSuspenseQueryOptions(Number(stockId), { from, to, interval })}
                >
                  {({ data: response }) => (
                    <StockChart
                      candles={response.data.candles}
                      averageVolume={response.data.averageVolume}
                      currency={response.data.currency}
                    />
                  )}
                </SuspenseQuery>
              </Suspense>
            </ErrorBoundary>
          </div>
          <ErrorBoundary key={`indicators-${stockId}`} fallback="오류가 발생했습니다">
            <Suspense fallback="로딩중">
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
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
      <Separator className="my-8" />
      <section aria-labelledby="stock-news-title">
        <h2 id="stock-news-title" className="typo-section-heading">
          관련 뉴스·공시
        </h2>
        <p className="mt-4 typo-body-sm text-muted-foreground">관련 자료 준비 중</p>
      </section>
    </main>
  )
}
