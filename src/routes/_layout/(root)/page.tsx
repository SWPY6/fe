// oxlint-disable react/no-array-index-key
import { ErrorBoundary, Suspense } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"

import {
  getSummary1SuspenseQueryOptions,
  getReadNewsSuspenseQueryOptions,
} from "@/api/generated/api"
import { PriceNumber } from "@/components/domain/PriceNumber"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table } from "@/components/ui/table"
import { Tabs } from "@/components/ui/tabs"
import { useGlobalUrlState } from "@/hooks/useGlobalUrlState"

import { IndustryFlowCarousel } from "./-components/IndustryFlowCarousel"

const data = {
  movers: [
    {
      name: "SK하이닉스",
      code: "000660",
      price: "198,400",
      change: 4.31,
      volume: "4,821,903",
      trend: [19, 37, 28, 51, 42, 71, 82, 77, 100],
    },
    {
      name: "한미반도체",
      code: "042700",
      price: "112,900",
      change: 3.56,
      volume: "2,107,486",
      trend: [16, 33, 25, 49, 42, 67, 81, 76, 97],
    },
    {
      name: "HD한국조선해양",
      code: "009540",
      price: "193,200",
      change: 2.84,
      volume: "611,704",
      trend: [21, 39, 32, 54, 45, 69, 78, 74, 96],
    },
    {
      name: "LG에너지솔루션",
      code: "373220",
      price: "402,500",
      change: -2.17,
      volume: "438,911",
      trend: [91, 74, 82, 57, 64, 39, 48, 26, 15],
    },
    {
      name: "에코프로비엠",
      code: "247540",
      price: "171,300",
      change: -3.08,
      volume: "892,327",
      trend: [94, 78, 85, 60, 67, 43, 52, 28, 16],
    },
  ],
}

export function RootPage() {
  const [{ market }, setGlobalUrlState] = useGlobalUrlState()
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState(0)
  const region = market === "domestic" ? "DOMESTIC" : "OVERSEAS"

  return (
    <main id="market-overview" className="py-8">
      <Tabs.Root
        value={market}
        onValueChange={(value) => {
          if (value === "domestic" || value === "overseas") {
            setSelectedQuoteIndex(0)
            setGlobalUrlState({ market: value })
          }
        }}
        className="gap-0"
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
        <Tabs.Content key={market} value={market} className="min-w-0">
          <IndustryFlowCarousel />
          <ErrorBoundary fallback="오류가 발생했습니다">
            <Suspense fallback="로딩중">
              <SuspenseQuery {...getSummary1SuspenseQueryOptions({ region })}>
                {({ data: response }) => (
                  <>
                    <Separator className="mt-8" />
                    <div
                      aria-label="주요 시장 지표 선택"
                      className="grid grid-cols-2 gap-y-5 py-5 sm:grid-cols-4 sm:gap-y-0"
                    >
                      {response.data?.indicators?.map((quote, index) => (
                        <Button
                          key={`${quote.indicator}-${index}`}
                          type="button"
                          variant="ghost"
                          onClick={() => setSelectedQuoteIndex(index)}
                          aria-pressed={selectedQuoteIndex === index}
                          className="group relative h-auto min-w-0 flex-col items-start gap-1.5 rounded-none py-0 pl-4 text-left text-foreground hover:bg-transparent hover:text-foreground sm:pl-6"
                        >
                          <Separator
                            orientation="vertical"
                            className="absolute top-0 left-0 group-aria-pressed:bg-primary"
                          />
                          <span className="typo-helper text-muted-foreground">{quote.name}</span>
                          <span className="typo-numeric-compact tabular-nums">
                            {quote.value?.toLocaleString("ko-KR") ?? "—"}
                            {quote.unit === "KRW" ? "원" : ""}
                          </span>
                          {quote.changeRate == null ? (
                            <span className="typo-caption text-muted-foreground">—</span>
                          ) : (
                            <PriceNumber
                              value={quote.changeRate}
                              format={{ style: "unit", unit: "percent", signDisplay: "exceptZero" }}
                              className="typo-caption"
                            />
                          )}
                        </Button>
                      ))}
                    </div>
                    <Separator />
                  </>
                )}
              </SuspenseQuery>
            </Suspense>
          </ErrorBoundary>

          <div className="mt-8 min-w-0">
            <section aria-labelledby="market-chart-title" className="min-w-0">
              <h2 id="market-chart-title" className="typo-section-heading">
                주요 시장 지표
              </h2>
              <ErrorBoundary fallback="오류가 발생했습니다">
                <Suspense fallback="로딩중">
                  <SuspenseQuery {...getSummary1SuspenseQueryOptions({ region })}>
                    {({ data: response }) => {
                      const quote = response.data?.indicators?.[selectedQuoteIndex]
                      return quote ? (
                        <>
                          <div className="mt-4 flex items-end justify-between gap-4">
                            <div>
                              <p className="typo-helper text-muted-foreground">{quote.name}</p>
                              <p className="mt-1 typo-numeric-lg max-sm:typo-numeric-md">
                                {quote.value?.toLocaleString("ko-KR") ?? "—"}
                                {quote.unit === "KRW" ? "원" : ""}
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
                        </>
                      ) : (
                        "시장 지표가 없습니다"
                      )
                    }}
                  </SuspenseQuery>
                </Suspense>
              </ErrorBoundary>
            </section>
          </div>

          <section id="industry-issues" aria-labelledby="industry-issues-title" className="mt-8">
            <h2 id="industry-issues-title" className="typo-section-heading">
              산업별 이슈
            </h2>
            <Separator className="mt-4" />
            <ErrorBoundary fallback="오류가 발생했습니다">
              <Suspense fallback="로딩중">
                <SuspenseQuery
                  {...getReadNewsSuspenseQueryOptions({
                    country: market === "domestic" ? "KR" : "US",
                  })}
                >
                  {({ data: response }) => (
                    <ol className="grid gap-6 pt-5 md:grid-cols-2 lg:gap-7">
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

          <Separator className="mt-8" />
          <section id="market-movers" aria-labelledby="market-movers-title" className="pt-8">
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
            <div className="mt-6">
              <Table.Root className="min-w-3xl">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>종목</Table.Head>
                    <Table.Head className="text-right">현재가</Table.Head>
                    <Table.Head className="text-right">등락률</Table.Head>
                    <Table.Head className="text-right">거래량</Table.Head>
                    <Table.Head className="text-right">일중 흐름</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.movers.map((stock) => (
                    <Table.Row key={stock.code} className="h-19">
                      <Table.Cell>
                        <span className="block typo-table-label">{stock.name}</span>
                        <span className="block typo-caption text-muted-foreground">
                          {stock.code}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-right tabular-nums">{stock.price}</Table.Cell>
                      <Table.Cell className="text-right">
                        <PriceNumber
                          value={stock.change}
                          format={{ style: "unit", unit: "percent", signDisplay: "exceptZero" }}
                        />
                      </Table.Cell>
                      <Table.Cell className="text-right tabular-nums">{stock.volume}</Table.Cell>
                      <Table.Cell className="text-right">
                        <svg
                          viewBox="0 0 128 48"
                          preserveAspectRatio="none"
                          className={
                            stock.change > 0
                              ? "ml-auto h-10 w-32 text-positive"
                              : "ml-auto h-10 w-32 text-negative"
                          }
                        >
                          <title>{stock.name} 일중 흐름</title>
                          <polyline
                            points={stock.trend
                              .map(
                                (value, index) =>
                                  (index * 128) / (stock.trend.length - 1) +
                                  "," +
                                  (44 - value * 0.4),
                              )
                              .join(" ")}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {data.movers.length === 0 && (
                    <Table.Row>
                      <Table.Cell
                        colSpan={5}
                        className="py-12 text-center typo-body-sm text-muted-foreground"
                      >
                        검색 결과가 없습니다. 종목명이나 종목코드를 다시 입력해 주세요.
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </div>
          </section>
        </Tabs.Content>
      </Tabs.Root>
    </main>
  )
}
