import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { useContext, useState } from "react"

import { Button } from "@/components/ui/button"
import { Table } from "@/components/ui/table"
import { Tabs } from "@/components/ui/tabs"
import { HeaderSearchContext } from "@/routes/__root"

const data = {
  asOf: "예시 데이터 · 2026.09.04 15:30 KST",
  lead: {
    sector: "반도체",
    headline: "반도체가 이끄는 상승",
    summary:
      "HBM 수요 기대가 반도체주에 집중됩니다. 외국인 매매 동향과 주요 종목의 움직임을 함께 살펴보세요.",
    change: "+2.84%",
    relatedStocks: ["SK하이닉스  +4.31%", "한미반도체  +3.56%"],
  },
  quotes: [
    {
      name: "KOSPI",
      value: "2,674.31",
      change: "+0.62%",
      trend: [16, 28, 22, 45, 39, 58, 69, 61, 87, 100],
    },
    {
      name: "KOSDAQ",
      value: "767.66",
      change: "-0.18%",
      trend: [87, 73, 78, 60, 67, 45, 53, 35, 42, 28],
    },
    {
      name: "USD/KRW",
      value: "1,337.40",
      change: "+0.21%",
      trend: [32, 41, 38, 54, 46, 58, 66, 62, 76, 82],
    },
    {
      name: "WTI",
      value: "$76.84",
      change: "+1.12%",
      trend: [24, 35, 30, 47, 54, 49, 70, 78, 73, 91],
    },
  ],
  news: [
    {
      sector: "반도체",
      title: "HBM 수요 기대와 반도체주",
      summary: "HBM 수요 전망 · 외국인 순매수 동향",
    },
    {
      sector: "2차전지",
      title: "리튬 가격과 수요 둔화 우려",
      summary: "리튬 가격 추이 · 전기차 수요 전망",
    },
    {
      sector: "조선",
      title: "고부가 선박 수주와 실적 전망",
      summary: "수주 잔고 · 선가 추이 · 실적 전망",
    },
  ],
  movers: [
    {
      name: "SK하이닉스",
      code: "000660",
      price: "198,400",
      change: "+4.31%",
      volume: "4,821,903",
      trend: [19, 37, 28, 51, 42, 71, 82, 77, 100],
    },
    {
      name: "한미반도체",
      code: "042700",
      price: "112,900",
      change: "+3.56%",
      volume: "2,107,486",
      trend: [16, 33, 25, 49, 42, 67, 81, 76, 97],
    },
    {
      name: "HD한국조선해양",
      code: "009540",
      price: "193,200",
      change: "+2.84%",
      volume: "611,704",
      trend: [21, 39, 32, 54, 45, 69, 78, 74, 96],
    },
    {
      name: "LG에너지솔루션",
      code: "373220",
      price: "402,500",
      change: "-2.17%",
      volume: "438,911",
      trend: [91, 74, 82, 57, 64, 39, 48, 26, 15],
    },
    {
      name: "에코프로비엠",
      code: "247540",
      price: "171,300",
      change: "-3.08%",
      volume: "892,327",
      trend: [94, 78, 85, 60, 67, 43, 52, 28, 16],
    },
  ],
}

export function RootPage() {
  const { query } = useContext(HeaderSearchContext)
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState(0)
  const selectedQuote = data.quotes[selectedQuoteIndex]
  const chartPoints = selectedQuote.trend
    .map(
      (value, index) =>
        (index * 700) / (selectedQuote.trend.length - 1) + "," + (190 - value * 1.5),
    )
    .join(" ")
  const movers = data.movers.filter((stock) =>
    (stock.name + " " + stock.code).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  )

  return (
    <>
      <main id="market-overview" className="py-8">
        <Tabs.Root defaultValue="domestic" className="gap-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="typo-caption text-muted-foreground">시장 개요</span>
            <Tabs.List variant="segmented" aria-label="시장 선택" className="shrink-0">
              <Tabs.Trigger value="domestic" className="max-md:min-h-11">
                국내 시장
              </Tabs.Trigger>
              <Tabs.Trigger value="overseas" className="max-md:min-h-11">
                해외 시장
              </Tabs.Trigger>
            </Tabs.List>
          </div>
          <Tabs.Content value="domestic" className="min-w-0">
            <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <h1 className="typo-section-heading md:typo-page-title">시장 요약</h1>
              <p className="typo-caption text-muted-foreground">{data.asOf}</p>
            </div>

            <div
              aria-label="주요 시장 지표 선택"
              className="mt-8 grid grid-cols-2 gap-y-5 border-y border-border py-5 sm:grid-cols-4 sm:gap-y-0"
            >
              {data.quotes.map((quote, index) => (
                <Button
                  key={quote.name}
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedQuoteIndex(index)}
                  aria-pressed={selectedQuoteIndex === index}
                  className="h-auto min-w-0 flex-col items-start gap-1.5 rounded-none border-l border-border py-0 pl-4 text-left text-foreground hover:bg-transparent hover:text-foreground aria-pressed:border-primary sm:pl-6"
                >
                  <span className="typo-helper text-muted-foreground">{quote.name}</span>
                  <span className="typo-numeric-compact tabular-nums">{quote.value}</span>
                  <span
                    className={
                      quote.change.startsWith("+")
                        ? "typo-caption text-positive tabular-nums"
                        : "typo-caption text-negative tabular-nums"
                    }
                  >
                    {quote.change}
                  </span>
                </Button>
              ))}
            </div>

            <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.375fr)_minmax(0,1fr)] lg:gap-10">
              <section aria-labelledby="market-chart-title" className="min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <h2 id="market-chart-title" className="typo-section-heading">
                    주요 시장 지표
                  </h2>
                  <span className="typo-label-xs text-muted-foreground">15분 지연</span>
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="typo-helper text-muted-foreground">{selectedQuote.name}</p>
                    <p className="mt-1 typo-numeric-lg max-sm:typo-numeric-md">
                      {selectedQuote.value}
                    </p>
                  </div>
                  <p
                    className={
                      selectedQuote.change.startsWith("+")
                        ? "pb-1 typo-numeric-sm text-positive tabular-nums"
                        : "pb-1 typo-numeric-sm text-negative tabular-nums"
                    }
                  >
                    {selectedQuote.change}
                  </p>
                </div>
                <svg
                  viewBox="0 0 700 200"
                  preserveAspectRatio="none"
                  className={
                    selectedQuote.change.startsWith("+")
                      ? "mt-5 h-44 w-full text-positive"
                      : "mt-5 h-44 w-full text-negative"
                  }
                >
                  <title>{selectedQuote.name} 일중 흐름</title>
                  <defs>
                    <linearGradient id="quote-area" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points={"0,200 " + chartPoints + " 700,200"} fill="url(#quote-area)" />
                  <polyline
                    points={chartPoints}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-2.5 typo-helper text-muted-foreground">
                  <span>{selectedQuote.name} / 일중 흐름</span>
                  <span
                    className={
                      selectedQuote.change.startsWith("+")
                        ? "text-positive tabular-nums"
                        : "text-negative tabular-nums"
                    }
                  >
                    {selectedQuote.change.startsWith("+") ? "↑" : "↓"} {selectedQuote.change}
                  </span>
                </div>
              </section>

              <section
                aria-labelledby="market-focus-title"
                className="border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
              >
                <p className="typo-caption text-muted-foreground">오늘의 시장 포커스</p>
                <h2 id="market-focus-title" className="mt-2.5 typo-section-heading">
                  {data.lead.headline}
                </h2>
                <p className="mt-6 typo-body-sm text-muted-foreground">{data.lead.summary}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 typo-label-sm text-positive">
                  {data.lead.relatedStocks.map((stock) => (
                    <span key={stock}>{stock}</span>
                  ))}
                </div>
                <Link
                  to="/industries"
                  className="mt-4 inline-flex items-center gap-1 typo-label-sm text-primary hover:underline"
                >
                  {data.lead.sector} 자세히 보기{" "}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
                <div className="mt-6 border-t border-border pt-5">
                  <p className="typo-caption text-muted-foreground">
                    {data.lead.sector} · 평균 등락률
                  </p>
                  <p className="mt-1 typo-numeric-md text-positive">{data.lead.change}</p>
                </div>
              </section>
            </div>

            <section id="industry-issues" aria-labelledby="industry-issues-title" className="mt-8">
              <h2 id="industry-issues-title" className="typo-subheading">
                산업별 이슈
              </h2>
              <ol className="mt-4 grid gap-6 border-t border-border pt-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                {data.news.map((story, index) => (
                  <li key={story.title} className="flex min-w-0 gap-4">
                    <span className="typo-table-value text-muted-foreground tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="typo-label-xs text-primary">{story.sector}</p>
                      <h3 className="mt-2 typo-heading-xs">{story.title}</h3>
                      <p className="mt-2 typo-body-sm text-muted-foreground">{story.summary}</p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  </li>
                ))}
              </ol>
            </section>

            <section
              id="market-movers"
              aria-labelledby="market-movers-title"
              className="mt-8 border-t border-border pt-8"
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
                    {movers.map((stock) => (
                      <Table.Row key={stock.code} className="h-19">
                        <Table.Cell>
                          <span className="block typo-table-label">{stock.name}</span>
                          <span className="block typo-caption text-muted-foreground">
                            {stock.code}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="text-right tabular-nums">{stock.price}</Table.Cell>
                        <Table.Cell
                          className={
                            stock.change.startsWith("+")
                              ? "text-right text-positive tabular-nums"
                              : "text-right text-negative tabular-nums"
                          }
                        >
                          {stock.change}
                        </Table.Cell>
                        <Table.Cell className="text-right tabular-nums">{stock.volume}</Table.Cell>
                        <Table.Cell className="text-right">
                          <svg
                            viewBox="0 0 128 48"
                            preserveAspectRatio="none"
                            className={
                              stock.change.startsWith("+")
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
                    {movers.length === 0 && (
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
          <Tabs.Content
            value="overseas"
            className="py-20 text-center typo-body-sm text-muted-foreground"
          >
            해외 시장 데모 데이터는 준비 중입니다.
          </Tabs.Content>
        </Tabs.Root>
      </main>

      <footer className="pb-8">
        <div className="border-t border-border pt-7">
          <p className="typo-wordmark-sm text-primary">ploutos.</p>
          <p className="mt-2 typo-caption text-muted-foreground">
            표시된 시세와 뉴스는 화면 구현을 위한 예시 데이터이며 투자 권유가 아닙니다.
          </p>
        </div>
      </footer>
    </>
  )
}
