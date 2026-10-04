// oxlint-disable react/no-array-index-key
import { ErrorBoundary, Suspense } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import { Link } from "@tanstack/react-router"
import { Separated } from "react-simplikit"

import {
  getReadNewsSuspenseQueryOptions,
  getReadStocksSuspenseQueryOptions,
} from "@/api/generated/api"
import { PriceNumber } from "@/components/domain/PriceNumber"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table } from "@/components/ui/table"
import { Tabs } from "@/components/ui/tabs"
import { useGlobalUrlState } from "@/hooks/useGlobalUrlState"

import { IndustryFlowCarousel } from "./-components/IndustryFlowCarousel"
import { StockSparkline } from "./-components/StockSparkline"
import { getMarketSummaryQueryOptions } from "./-query/market-summary"

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
            <ErrorBoundary fallback="오류가 발생했습니다">
              <Suspense fallback="로딩중">
                <SuspenseQuery {...getMarketSummaryQueryOptions({ region })}>
                  {({ data: response }) => {
                    const indicators = response.data?.indicators ?? []

                    return (
                      <Tabs.Root defaultValue={indicators[0]?.indicator ?? "0"} className="gap-8">
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
                                  <p className="typo-helper text-muted-foreground">{quote.name}</p>
                                  <p className="mt-1 typo-numeric-lg max-sm:typo-numeric-md">
                                    {quote.value?.toLocaleString("ko-KR") ?? "—"}
                                    {quote.unit === "KRW" ? "원" : ""}
                                    {quote.unit === "USD" ? " USD" : ""}
                                  </p>
                                </div>
                                {quote.changeRate == null ? (
                                  <p className="pb-1 typo-numeric-sm text-muted-foreground">—</p>
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
                              <div className="mt-5 flex h-44 items-center justify-center typo-helper text-muted-foreground">
                                차트 준비 중
                              </div>
                            </Tabs.Content>
                          ))}
                          {indicators.length === 0 && "시장 지표가 없습니다"}
                        </section>
                      </Tabs.Root>
                    )
                  }}
                </SuspenseQuery>
              </Suspense>
            </ErrorBoundary>

            <section
              id="industry-issues"
              aria-labelledby="industry-issues-title"
              className="flex flex-col gap-6"
            >
              <h2 id="industry-issues-title" className="typo-section-heading">
                산업별 이슈
              </h2>
              <ErrorBoundary fallback="오류가 발생했습니다">
                <Suspense fallback="로딩중">
                  <SuspenseQuery
                    {...getReadNewsSuspenseQueryOptions({
                      country: market === "domestic" ? "KR" : "US",
                    })}
                  >
                    {({ data: response }) => (
                      <ol className="grid gap-6 md:grid-cols-2 lg:gap-7">
                        {response.data?.map((industry, industryIndex) => (
                          <li
                            key={`${industry.code}-${industryIndex}`}
                            className="flex min-w-0 gap-4"
                          >
                            <span className="typo-table-value text-muted-foreground tabular-nums">
                              {industry.rank}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="typo-label-xs text-primary">{industry.displayName}</p>
                              {industry.news?.map((story, storyIndex) => (
                                <div key={`${story.url}-${storyIndex}`}>
                                  <h3 className="mt-2 typo-heading-xs">
                                    <a href={story.url}>{story.title}</a>
                                  </h3>
                                  <p className="mt-2 typo-body-sm text-muted-foreground">
                                    {story.publisher}
                                  </p>
                                </div>
                              ))}
                              <p className="mt-2 typo-body-sm text-muted-foreground">
                                관련 뉴스는 가격 변동의 원인을 의미하지 않습니다.
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </SuspenseQuery>
                </Suspense>
              </ErrorBoundary>
            </section>

            <section
              id="market-movers"
              aria-labelledby="market-movers-title"
              className="flex flex-col gap-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 id="market-movers-title" className="typo-section-heading">
                    주요 변동 종목
                  </h2>
                  <p className="mt-2 typo-body-sm text-muted-foreground">
                    종목별 현재가, 등락률, 거래량을 비교해 보세요.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/movers">전체 보기</Link>
                </Button>
              </div>
              <div>
                <Table.Root className="min-w-3xl">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>종목</Table.Head>
                      <Table.Head className="text-right">현재가</Table.Head>
                      <Table.Head className="text-right">등락률</Table.Head>
                      <Table.Head className="text-right">거래량</Table.Head>
                      <Table.Head className="text-right">최근 종가 흐름</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <ErrorBoundary
                    fallback={
                      <Table.Body>
                        <Table.Row>
                          <Table.Cell colSpan={5}>오류가 발생했습니다</Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    }
                  >
                    <Suspense
                      fallback={
                        <Table.Body>
                          <Table.Row>
                            <Table.Cell colSpan={5}>로딩중</Table.Cell>
                          </Table.Row>
                        </Table.Body>
                      }
                    >
                      <SuspenseQuery
                        {...getReadStocksSuspenseQueryOptions({
                          country: market === "domestic" ? "KR" : "US",
                          sort: "ALL",
                          size: 5,
                        })}
                      >
                        {({ data: response }) => (
                          <Table.Body>
                            {response.data.items.map((stock) => (
                              <Table.Row key={stock.stockId} className="h-19">
                                <Table.Cell>
                                  <Link
                                    to="/stocks/$stockId"
                                    params={{ stockId: String(stock.stockId) }}
                                    className="block typo-table-label hover:text-primary hover:underline"
                                  >
                                    {stock.name}
                                  </Link>
                                  <span className="block typo-caption text-muted-foreground">
                                    {stock.ticker}
                                  </span>
                                </Table.Cell>
                                <Table.Cell className="text-right tabular-nums">
                                  {stock.price.toLocaleString("ko-KR")} {stock.currency}
                                </Table.Cell>
                                <Table.Cell className="text-right">
                                  <PriceNumber
                                    value={stock.changeRate}
                                    format={{
                                      style: "unit",
                                      unit: "percent",
                                      signDisplay: "exceptZero",
                                    }}
                                  />
                                </Table.Cell>
                                <Table.Cell className="text-right tabular-nums">
                                  {stock.indicators.volume?.toLocaleString("ko-KR") ?? "—"}
                                </Table.Cell>
                                <Table.Cell className="text-right">
                                  <ErrorBoundary fallback="—">
                                    <Suspense fallback="—">
                                      <StockSparkline
                                        stockId={stock.stockId}
                                        name={stock.name}
                                        changeRate={stock.changeRate}
                                      />
                                    </Suspense>
                                  </ErrorBoundary>
                                </Table.Cell>
                              </Table.Row>
                            ))}
                            {response.data.items.length === 0 && (
                              <Table.Row>
                                <Table.Cell
                                  colSpan={5}
                                  className="py-12 text-center typo-body-sm text-muted-foreground"
                                >
                                  표시할 종목이 없습니다.
                                </Table.Cell>
                              </Table.Row>
                            )}
                          </Table.Body>
                        )}
                      </SuspenseQuery>
                    </Suspense>
                  </ErrorBoundary>
                </Table.Root>
              </div>
            </section>
          </Separated>
        </Tabs.Content>
      </Tabs.Root>
    </main>
  )
}
