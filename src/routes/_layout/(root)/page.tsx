// oxlint-disable react/no-array-index-key
import { Suspense } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import { QueryErrorResetBoundary } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Separated } from "react-simplikit"

import {
  getReadNewsSuspenseQueryOptions,
  getReadMoversSuspenseQueryOptions,
} from "@/api/generated/api"
import { ApiError } from "@/api/http/error"
import { getErrorDescription } from "@/api/query/errorPolicy"
import { PriceNumber } from "@/components/domain/PriceNumber"
import { Button } from "@/components/ui/button"
import { QueryErrorBoundary } from "@/components/ui/QueryErrorBoundary"
import { Result } from "@/components/ui/Result"
import { Separator } from "@/components/ui/separator"
import { Tabs } from "@/components/ui/tabs"
import { useGlobalUrlState } from "@/hooks/useGlobalUrlState"

import { IndustryFlowCarousel } from "./-components/IndustryFlowCarousel"
import { MarketIndicatorChart, isChartIndicator } from "./-components/MarketIndicatorChart"
import { getMarketSummaryQueryOptions } from "./-query/market-summary"

function formatIndicatorValueAt(valueAt: string | undefined, indicator: string | undefined) {
  if (!valueAt) return "기준 시각 없음"

  const date = new Date(valueAt)
  if (Number.isNaN(date.getTime())) return "기준 시각 없음"

  const isUsIndex = indicator === "NASDAQ" || indicator === "SP500"
  const formatted = date.toLocaleString("ko-KR", {
    timeZone: isUsIndex ? "America/New_York" : "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  return `${formatted} ${isUsIndex ? "ET" : "KST"} 기준`
}

export function RootPage() {
  const [{ market }, setGlobalUrlState] = useGlobalUrlState()
  const region = market === "domestic" ? "DOMESTIC" : "OVERSEAS"

  return (
    <main id="market-overview" className="py-8">
      <Tabs.Root
        value={market}
        onValueChange={(value) => {
          if (value === "domestic" || value === "overseas") {
            setGlobalUrlState({ market: value })
          }
        }}
        className="gap-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs.List variant="segmented" aria-label="시장 선택" className="shrink-0">
            <Tabs.Trigger value="domestic" className="max-md:min-h-11">
              국내 시장
            </Tabs.Trigger>
            <Tabs.Trigger value="overseas" className="max-md:min-h-11">
              해외 시장
            </Tabs.Trigger>
          </Tabs.List>
        </div>
        <Separator />
        <Tabs.Content key={market} value={market} className="flex min-w-0 flex-col gap-8">
          <Separated by={<Separator />}>
            <IndustryFlowCarousel />
            <div className="min-w-0">
              <QueryErrorResetBoundary>
                <QueryErrorBoundary
                  shouldCatch={ApiError}
                  fallback={({ error, reset }) => (
                    <Result
                      role="alert"
                      title="시장 지표를 불러오지 못했습니다"
                      description={getErrorDescription(error)}
                      button={<Result.Button onClick={reset}>다시 시도</Result.Button>}
                    />
                  )}
                >
                  <Suspense data-skeleton fallback="로딩중">
                    <SuspenseQuery {...getMarketSummaryQueryOptions({ region })}>
                      {({ data: response, error }) => {
                        const indicators = response.data?.indicators ?? []

                        return (
                          <Tabs.Root
                            defaultValue={indicators[0]?.indicator ?? "0"}
                            className="gap-8"
                          >
                            {error && (
                              <output className="typo-helper text-muted-foreground">
                                시장 지표를 갱신하지 못했습니다. 마지막으로 받은 정보를 표시합니다.
                              </output>
                            )}
                            <Tabs.List
                              variant="underline"
                              showIndicator={false}
                              aria-label="주요 시장 지표 선택"
                              className="grid w-full grid-cols-2 gap-y-5 sm:grid-cols-4 sm:gap-y-0"
                            >
                              {indicators.map((quote, index) => (
                                <Tabs.Trigger
                                  key={`${quote.indicator}-${index}`}
                                  value={quote.indicator ?? String(index)}
                                  className="group relative min-w-0 flex-col items-start gap-1.5 rounded-none px-4 py-0 text-left text-foreground group-data-[variant=underline]/tabs-list:h-auto hover:bg-transparent hover:text-foreground sm:pl-6"
                                >
                                  <span className="typo-helper text-muted-foreground">
                                    {quote.name}
                                  </span>
                                  <span className="typo-numeric-compact tabular-nums">
                                    {quote.value?.toLocaleString("ko-KR") ?? "—"}
                                    {quote.unit === "KRW" ? "원" : ""}
                                    {quote.unit === "USD" ? " USD" : ""}
                                  </span>
                                  {quote.changeRate == null ? (
                                    <span className="typo-caption text-muted-foreground">—</span>
                                  ) : (
                                    <PriceNumber
                                      value={quote.changeRate}
                                      format={{
                                        style: "unit",
                                        unit: "percent",
                                        signDisplay: "exceptZero",
                                      }}
                                      className="typo-caption"
                                    />
                                  )}
                                </Tabs.Trigger>
                              ))}
                            </Tabs.List>
                            <Separator />
                            <section aria-labelledby="market-chart-title" className="min-w-0">
                              <h2 id="market-chart-title" className="typo-section-heading">
                                주요 시장 지표
                              </h2>
                              {indicators.map((quote, index) => (
                                <Tabs.Content
                                  key={`${quote.indicator}-${index}`}
                                  value={quote.indicator ?? String(index)}
                                >
                                  <div className="mt-4 flex items-end justify-between gap-4">
                                    <div>
                                      <p className="typo-helper text-muted-foreground">
                                        {quote.name}
                                      </p>
                                      <p className="mt-1 typo-numeric-lg max-sm:typo-numeric-md">
                                        {quote.value?.toLocaleString("ko-KR") ?? "—"}
                                        {quote.unit === "KRW" ? "원" : ""}
                                        {quote.unit === "USD" ? " USD" : ""}
                                      </p>
                                      {quote.indicator !== "WTI" && (
                                        <p className="mt-2 typo-helper text-muted-foreground">
                                          {formatIndicatorValueAt(quote.valueAt, quote.indicator)}
                                        </p>
                                      )}
                                    </div>
                                    {quote.changeRate == null ? (
                                      <p className="pb-1 typo-numeric-sm text-muted-foreground">
                                        —
                                      </p>
                                    ) : (
                                      <PriceNumber
                                        as="p"
                                        value={quote.changeRate}
                                        format={{
                                          style: "unit",
                                          unit: "percent",
                                          signDisplay: "exceptZero",
                                        }}
                                        className="pb-1 typo-numeric-sm"
                                      />
                                    )}
                                  </div>
                                  {isChartIndicator(quote.indicator) ? (
                                    <MarketIndicatorChart indicator={quote.indicator} />
                                  ) : (
                                    <p className="mt-5 flex h-44 items-center justify-center typo-helper text-muted-foreground">
                                      차트가 없습니다
                                    </p>
                                  )}
                                </Tabs.Content>
                              ))}
                              {indicators.length === 0 && "시장 지표가 없습니다"}
                            </section>
                          </Tabs.Root>
                        )
                      }}
                    </SuspenseQuery>
                  </Suspense>
                </QueryErrorBoundary>
              </QueryErrorResetBoundary>
            </div>

            <section
              id="industry-issues"
              aria-labelledby="industry-issues-title"
              className="flex flex-col gap-6"
            >
              <h2 id="industry-issues-title" className="typo-section-heading">
                산업별 이슈
              </h2>
              <QueryErrorResetBoundary>
                <QueryErrorBoundary
                  shouldCatch={ApiError}
                  fallback={({ error, reset }) => (
                    <Result
                      role="alert"
                      title="산업별 뉴스를 불러오지 못했습니다"
                      description={getErrorDescription(error)}
                      button={<Result.Button onClick={reset}>다시 시도</Result.Button>}
                    />
                  )}
                >
                  <Suspense data-skeleton fallback="로딩중">
                    <ol className="grid gap-6 md:grid-cols-2 lg:gap-7">
                      <SuspenseQuery
                        {...getReadNewsSuspenseQueryOptions({
                          country: market === "domestic" ? "KR" : "US",
                        })}
                      >
                        {({ data: response }) => (
                          <>
                            {response.data?.map((industry, industryIndex) => (
                              <li
                                key={`${industry.code}-${industryIndex}`}
                                className="flex min-w-0 gap-4"
                              >
                                <span className="typo-table-value text-muted-foreground tabular-nums">
                                  {industry.rank}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="typo-label-xs text-primary">
                                    {industry.displayName}
                                  </p>
                                  {industry.news?.length ? (
                                    <>
                                      {industry.news.map((story, storyIndex) => (
                                        <div
                                          key={`${story.url}-${storyIndex}`}
                                          className="relative py-2"
                                        >
                                          <h3 className="mt-2 typo-heading-xs">
                                            <a
                                              href={story.url}
                                              className="after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-ring"
                                            >
                                              {story.title}
                                            </a>
                                          </h3>
                                          <p className="mt-2 typo-body-sm text-muted-foreground">
                                            {story.publisher}
                                          </p>
                                        </div>
                                      ))}
                                      <p className="mt-2 typo-body-sm text-muted-foreground">
                                        관련 뉴스는 가격 변동의 원인을 의미하지 않습니다.
                                      </p>
                                    </>
                                  ) : (
                                    <p className="mt-2 typo-body-sm text-muted-foreground">
                                      관련 뉴스가 없습니다.
                                    </p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </>
                        )}
                      </SuspenseQuery>
                    </ol>
                  </Suspense>
                </QueryErrorBoundary>
              </QueryErrorResetBoundary>
            </section>

            <section
              id="market-movers"
              aria-labelledby="market-movers-title"
              className="flex flex-col gap-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 id="market-movers-title" className="typo-section-heading">
                  주요 변동 종목
                </h2>
                <Button asChild variant="outline" size="sm">
                  <Link to="/movers">전체 보기</Link>
                </Button>
              </div>
              <QueryErrorResetBoundary>
                <QueryErrorBoundary
                  shouldCatch={ApiError}
                  fallback={({ error, reset }) => (
                    <Result
                      role="alert"
                      title="종목 목록을 불러오지 못했습니다"
                      description={getErrorDescription(error)}
                      button={<Result.Button onClick={reset}>다시 시도</Result.Button>}
                    />
                  )}
                >
                  <Suspense fallback={<p>종목을 불러오는 중입니다.</p>}>
                    <SuspenseQuery
                      {...getReadMoversSuspenseQueryOptions({
                        country: market === "domestic" ? "KR" : "US",
                        condition: "RISING",
                      })}
                    >
                      {({ data: response }) => {
                        const stocks = response.data?.stocks
                        if (!Array.isArray(stocks))
                          throw new Error("종목 목록 응답이 올바르지 않습니다.")
                        const topStocks = stocks.slice(0, 4)
                        if (topStocks.length === 0) return <p>현재 표시할 상승 종목이 없습니다.</p>

                        return (
                          <ol className="grid gap-4 md:grid-cols-2">
                            {topStocks.map((stock, index) => (
                              <li
                                key={`${stock.ticker ?? stock.name ?? "stock"}-${index}`}
                                className="relative flex min-w-0 items-center justify-between gap-4 border-b border-border py-3"
                              >
                                <div className="min-w-0">
                                  {stock.stockId != null ? (
                                    <Link
                                      to="/stocks/$stockId"
                                      params={{ stockId: String(stock.stockId) }}
                                      className="typo-table-label after:absolute after:inset-0 hover:text-primary hover:underline focus-visible:after:outline-2 focus-visible:after:outline-ring"
                                    >
                                      {stock.name ?? "이름 없음"}
                                    </Link>
                                  ) : (
                                    <span className="typo-table-label">
                                      {stock.name ?? "이름 없음"}
                                    </span>
                                  )}
                                  <p className="typo-caption text-muted-foreground">
                                    {stock.ticker ?? "—"}
                                  </p>
                                </div>
                                <div className="shrink-0 text-right tabular-nums">
                                  <p>
                                    {stock.price == null
                                      ? "—"
                                      : stock.price.toLocaleString("ko-KR")}
                                  </p>
                                  <p className="typo-caption text-muted-foreground">
                                    {stock.changeRate == null ? "—" : `${stock.changeRate}%`}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ol>
                        )
                      }}
                    </SuspenseQuery>
                  </Suspense>
                </QueryErrorBoundary>
              </QueryErrorResetBoundary>
            </section>
          </Separated>
        </Tabs.Content>
      </Tabs.Root>
    </main>
  )
}
