import { createFileRoute } from "@tanstack/react-router"
import { Bell, ChartLine, ChevronRight, Landmark, Search, UserRound } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"
import { Tabs } from "@/components/ui/tabs"

type Direction = "positive" | "negative" | "neutral"
type Market = "domestic" | "global"

type MarketIndex = {
  name: string
  value: string
  change: number
  points: number[]
}

const marketIndexes: Record<Market, MarketIndex[]> = {
  domestic: [
    {
      name: "KOSPI",
      value: "2,674.31",
      change: 0.62,
      points: [28, 34, 31, 42, 39, 48, 53, 49, 61, 66],
    },
    {
      name: "KOSDAQ",
      value: "767.66",
      change: -0.18,
      points: [62, 58, 61, 52, 55, 48, 44, 49, 42, 39],
    },
    {
      name: "USD/KRW",
      value: "1,337.40",
      change: 0.21,
      points: [37, 39, 36, 43, 41, 45, 47, 44, 49, 52],
    },
    {
      name: "WTI",
      value: "$76.84",
      change: 1.12,
      points: [23, 27, 25, 34, 31, 43, 47, 44, 56, 63],
    },
  ],
  global: [
    {
      name: "S&P 500",
      value: "5,864.67",
      change: 0.4,
      points: [31, 34, 32, 39, 42, 40, 49, 51, 57, 61],
    },
    {
      name: "NASDAQ",
      value: "18,489.55",
      change: 0.6,
      points: [27, 31, 29, 36, 43, 39, 48, 54, 51, 62],
    },
    {
      name: "DOW",
      value: "43,275.91",
      change: -0.12,
      points: [59, 61, 54, 57, 49, 51, 45, 47, 41, 39],
    },
    {
      name: "NIKKEI",
      value: "38,981.75",
      change: 0.18,
      points: [35, 32, 39, 37, 44, 42, 48, 46, 51, 54],
    },
  ],
}

const marketIssues = [
  {
    sector: "반도체",
    title: "HBM 수요 확대 기대감에 반도체주 강세",
    summary: "외국인 순매수가 집중되며 대형주 중심으로 상승 폭을 키우고 있습니다.",
    direction: "positive" as const,
  },
  {
    sector: "2차전지",
    title: "리튬 가격 약세와 수요 둔화 우려",
    summary: "원자재 가격 불확실성이 이어지며 관련 종목의 투자 심리가 위축됐습니다.",
    direction: "negative" as const,
  },
  {
    sector: "조선",
    title: "고부가 선박 수주 모멘텀 지속",
    summary: "수주 잔고와 선가 상승이 실적 개선 기대를 뒷받침하고 있습니다.",
    direction: "positive" as const,
  },
]

const movers = [
  { name: "SK하이닉스", code: "000660", price: "198,400", change: 4.31, volume: "4,821,903" },
  { name: "한미반도체", code: "042700", price: "112,900", change: 3.56, volume: "2,107,486" },
  { name: "HD한국조선해양", code: "009540", price: "193,200", change: 2.84, volume: "611,704" },
  { name: "LG에너지솔루션", code: "373220", price: "402,500", change: -2.17, volume: "438,911" },
  { name: "에코프로비엠", code: "247540", price: "171,300", change: -3.08, volume: "892,327" },
]

const directionOf = (change: number): Direction =>
  change > 0 ? "positive" : change < 0 ? "negative" : "neutral"

const changeLabel = (change: number) => `${change > 0 ? "+" : ""}${change.toFixed(2)}%`

const directionTextClass: Record<Direction, string> = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-muted-foreground",
}

function Sparkline({ points, direction }: { points: number[]; direction: Direction }) {
  const width = 132
  const height = 48
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const coordinates = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width
      const y = height - ((point - min) / range) * (height - 8) - 4
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="h-12 w-32">
      <polyline
        points={coordinates}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        className={directionTextClass[direction]}
      />
    </svg>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-20 bg-card/95 shadow-xs backdrop-blur-sm">
      <div className="flex h-16 w-full items-center gap-5 px-5 sm:px-6 lg:px-8 2xl:px-12">
        <a href="/" className="shrink-0 text-item-title text-primary" aria-label="PLOUTOS 홈">
          PLOUTOS
        </a>

        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="bg-muted/60 pr-3 pl-9 shadow-none"
            placeholder="종목명 또는 종목코드 검색"
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="알림">
            <Bell />
          </Button>
          <Button variant="ghost" size="icon" aria-label="내 계정">
            <UserRound />
          </Button>
        </div>
      </div>

      <nav className="w-full overflow-x-auto px-5 sm:px-6 lg:px-8 2xl:px-12" aria-label="주요 메뉴">
        <Tabs.Root defaultValue="summary">
          <Tabs.List variant="line" className="h-11" aria-label="주요 메뉴">
            <Tabs.Trigger value="summary" className="h-full rounded-none px-4 text-control">
              시장 요약
            </Tabs.Trigger>
            <Tabs.Trigger value="industry" className="h-full rounded-none px-4 text-control">
              산업별 동향
            </Tabs.Trigger>
            <Tabs.Trigger value="movers" className="h-full rounded-none px-4 text-control">
              주요 변동 종목
            </Tabs.Trigger>
            <Tabs.Trigger value="detail" className="h-full rounded-none px-4 text-control">
              종목 상세
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </nav>
    </header>
  )
}

function IndustryBrief() {
  return (
    <Card.Root>
      <Card.Content className="grid gap-7 py-1 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mb-4 text-meta text-primary">오늘의 산업 흐름</p>
          <p className="mb-2 text-meta text-muted-foreground">가장 강한 흐름을 보이는 산업</p>
          <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
            <h2 className="text-section-title">반도체</h2>
            <span className="text-item-title text-positive tabular-nums">평균 +2.84%</span>
          </div>
          <p className="mt-4 max-w-2xl text-body text-muted-foreground">
            HBM 중심의 수요 기대와 외국인 매수세가 맞물리며 대형 반도체 종목이 시장 상승을 이끌고
            있습니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-meta">
          <span>
            SK하이닉스 <span className="text-positive tabular-nums">+4.31%</span>
          </span>
          <span>
            한미반도체 <span className="text-positive tabular-nums">+3.56%</span>
          </span>
        </div>
      </Card.Content>
    </Card.Root>
  )
}

function MarketOverview({ market }: { market: Market }) {
  const indexes = marketIndexes[market]
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = indexes[selectedIndex] ?? indexes[0]
  const selectedDirection = directionOf(selected.change)
  const chartColor =
    selectedDirection === "positive"
      ? "var(--positive)"
      : selectedDirection === "negative"
        ? "var(--negative)"
        : "var(--muted-foreground)"
  const chartMin = Math.min(...selected.points)
  const chartRange = Math.max(...selected.points) - chartMin || 1
  const chartPoints = selected.points
    .map((point, index) => {
      const x = (index / (selected.points.length - 1)) * 640
      const y = 158 - ((point - chartMin) / chartRange) * 146
      return `${x},${y}`
    })
    .join(" ")

  return (
    <Card.Root>
      <Card.Header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Card.Title className="text-section-title">시장 한눈에 보기</Card.Title>
          <p className="mt-1 text-body text-muted-foreground">주요 지수의 현재 흐름입니다.</p>
        </div>
        <span className="text-meta text-muted-foreground">15분 지연</span>
      </Card.Header>
      <Card.Content>
        <div className="grid gap-1 rounded-lg bg-muted p-1 sm:grid-cols-2 xl:grid-cols-4">
          {indexes.map((item, index) => {
            const direction = directionOf(item.change)
            const isSelected = selectedIndex === index

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`rounded-md p-3 text-left transition-[background-color,box-shadow] duration-150 ease-out ${isSelected ? "bg-card shadow-xs" : "hover:bg-card/60"}`}
              >
                <span className="text-meta text-muted-foreground">{item.name}</span>
                <span className="mt-1 flex items-baseline justify-between gap-2">
                  <strong className="text-data tabular-nums">{item.value}</strong>
                  <span className={`text-data tabular-nums ${directionTextClass[direction]}`}>
                    {changeLabel(item.change)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-6 rounded-lg bg-secondary/70 px-4 pt-4 pb-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-meta text-muted-foreground">{selected.name}</p>
              <p className="mt-1 text-section-title tabular-nums">{selected.value}</p>
            </div>
            <p className={`text-data tabular-nums ${directionTextClass[selectedDirection]}`}>
              {changeLabel(selected.change)}
            </p>
          </div>
          <svg
            viewBox="0 0 640 170"
            preserveAspectRatio="none"
            className="mt-3 h-44 w-full"
            aria-label={`${selected.name} 일중 추이`}
          >
            <defs>
              <linearGradient id="market-chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity="0.22" />
                <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,170 ${chartPoints} 640,170`} fill="url(#market-chart-fill)" />
            <polyline
              points={chartPoints}
              fill="none"
              stroke={chartColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </Card.Content>
    </Card.Root>
  )
}

function MarketNews() {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title className="text-section-title">오늘의 핵심 뉴스</Card.Title>
        <p className="text-body text-muted-foreground">산업 흐름에 영향을 주는 주요 이슈입니다.</p>
      </Card.Header>
      <Card.Content className="p-0">
        {marketIssues.map((issue) => (
          <button
            key={issue.sector}
            type="button"
            className="group flex w-full gap-3 px-6 py-5 text-left hover:bg-muted/45"
          >
            <div className="min-w-0 flex-1">
              <Badge tone={issue.direction}>{issue.sector}</Badge>
              <h3 className="mt-3 text-item-title group-hover:text-primary">{issue.title}</h3>
              <p className="mt-1 line-clamp-2 text-body text-muted-foreground">{issue.summary}</p>
            </div>
            <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </Card.Content>
    </Card.Root>
  )
}

function MoversTable() {
  return (
    <Card.Root>
      <Card.Header className="flex-row items-end justify-between space-y-0">
        <div>
          <Card.Title className="text-section-title">주요 변동 종목</Card.Title>
          <p className="mt-1 text-body text-muted-foreground">
            거래량과 등락 폭이 두드러진 종목입니다.
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          전체 보기 <ChevronRight />
        </Button>
      </Card.Header>
      <Card.Content>
        <Table.Root>
          <Table.Header>
            <Table.Row className="hover:bg-transparent">
              <Table.Head>종목</Table.Head>
              <Table.Head className="text-right">현재가</Table.Head>
              <Table.Head className="text-right">등락률</Table.Head>
              <Table.Head className="hidden text-right sm:table-cell">거래량</Table.Head>
              <Table.Head className="hidden w-40 lg:table-cell">일중 흐름</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {movers.map((stock, index) => {
              const direction = directionOf(stock.change)
              const points =
                direction === "positive"
                  ? [22, 28, 25, 34, 31, 41, 45, 43, 51]
                  : [51, 46, 49, 40, 42, 34, 37, 29, 25]

              return (
                <Table.Row key={stock.code}>
                  <Table.Cell>
                    <div className="text-data">{stock.name}</div>
                    <div className="text-meta text-muted-foreground tabular-nums">{stock.code}</div>
                  </Table.Cell>
                  <Table.Cell className="text-right text-data tabular-nums">
                    {stock.price}
                  </Table.Cell>
                  <Table.Cell
                    className={`text-right text-data tabular-nums ${directionTextClass[direction]}`}
                  >
                    {changeLabel(stock.change)}
                  </Table.Cell>
                  <Table.Cell className="hidden text-right text-meta text-muted-foreground tabular-nums sm:table-cell">
                    {stock.volume}
                  </Table.Cell>
                  <Table.Cell className="hidden lg:table-cell">
                    <Sparkline
                      points={points.map((point) => point + index)}
                      direction={direction}
                    />
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </Card.Content>
    </Card.Root>
  )
}

function IndexPage() {
  const [market, setMarket] = useState<Market>("domestic")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="w-full space-y-7 px-5 py-8 sm:px-6 lg:px-8 lg:py-10 2xl:px-12">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-meta text-primary">MARKET BRIEFING</p>
            <h1 className="text-page-title">오늘 시장의 흐름을 읽다</h1>
            <p className="mt-2 text-body text-muted-foreground">
              핵심 지표와 산업 이슈를 한 화면에서 확인하세요.
            </p>
          </div>
          <Tabs.Root value={market} onValueChange={(value) => setMarket(value as Market)}>
            <Tabs.List aria-label="시장 선택">
              <Tabs.Trigger value="domestic">
                <Landmark /> 국내 시장
              </Tabs.Trigger>
              <Tabs.Trigger value="global">
                <ChartLine /> 해외 시장
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
        </div>

        <IndustryBrief />

        <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,1fr)]">
          <MarketOverview market={market} key={market} />
          <MarketNews />
        </div>

        <MoversTable />
      </main>
    </div>
  )
}

export const Route = createFileRoute("/demo")({ component: IndexPage })
