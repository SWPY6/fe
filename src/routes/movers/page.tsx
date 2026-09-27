import { Link } from "@tanstack/react-router"
import { Shield } from "lucide-react"
import { useContext, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table } from "@/components/ui/table"
import { Tabs } from "@/components/ui/tabs"
import { HeaderSearchContext } from "@/routes/__root"

const data = {
  asOf: "예시 2026.09.04 · 15:30 KST · 직전 거래일 종가 대비",
  stocks: [
    {
      name: "현대차",
      code: "005380",
      industry: "자동차",
      price: "248,000",
      change: "+3.24%",
      volume: "245,000",
      ratio: "0.95",
      cap: "86.6",
      trade: "608",
    },
    {
      name: "한온시스템",
      code: "018880",
      industry: "자동차",
      price: "4,320",
      change: "+2.13%",
      volume: "521,900",
      ratio: "2.06",
      cap: "1.5",
      trade: "23",
    },
    {
      name: "대한항공",
      code: "003490",
      industry: "운송",
      price: "22,400",
      change: "+1.92%",
      volume: "1,056,500",
      ratio: "2.10",
      cap: "7.8",
      trade: "237",
    },
    {
      name: "기아",
      code: "000270",
      industry: "자동차",
      price: "102,000",
      change: "+1.85%",
      volume: "337,300",
      ratio: "1.32",
      cap: "34.9",
      trade: "344",
    },
    {
      name: "현대건설",
      code: "000720",
      industry: "건설",
      price: "32,100",
      change: "+1.68%",
      volume: "731,900",
      ratio: "1.64",
      cap: "11.0",
      trade: "235",
    },
    {
      name: "세아베스틸지주",
      code: "001430",
      industry: "철강",
      price: "24,150",
      change: "+1.26%",
      volume: "591,900",
      ratio: "1.92",
      cap: "8.2",
      trade: "143",
    },
    {
      name: "신세계",
      code: "004170",
      industry: "유통",
      price: "169,800",
      change: "+1.20%",
      volume: "1,078,800",
      ratio: "2.61",
      cap: "58.6",
      trade: "1,832",
    },
    {
      name: "팬오션",
      code: "028670",
      industry: "운송",
      price: "5,230",
      change: "+1.16%",
      volume: "1,241,100",
      ratio: "1.04",
      cap: "1.9",
      trade: "65",
    },
    {
      name: "한화솔루션",
      code: "009830",
      industry: "화학",
      price: "27,150",
      change: "+1.14%",
      volume: "754,200",
      ratio: "2.15",
      cap: "9.6",
      trade: "205",
    },
    {
      name: "SK이노베이션",
      code: "096770",
      industry: "에너지",
      price: "108,000",
      change: "+1.04%",
      volume: "1,565,700",
      ratio: "1.50",
      cap: "39.1",
      trade: "1,691",
    },
    {
      name: "대한제강",
      code: "084010",
      industry: "철강",
      price: "12,340",
      change: "+0.98%",
      volume: "684,200",
      ratio: "2.29",
      cap: "4.3",
      trade: "84",
    },
    {
      name: "농심",
      code: "004370",
      industry: "음식료",
      price: "412,000",
      change: "+0.91%",
      volume: "1,543,400",
      ratio: "0.99",
      cap: "143.0",
      trade: "6,359",
    },
    {
      name: "DL이앤씨",
      code: "375500",
      industry: "건설",
      price: "34,700",
      change: "+0.86%",
      volume: "1,008,800",
      ratio: "0.95",
      cap: "12.2",
      trade: "350",
    },
    {
      name: "이마트",
      code: "139480",
      industry: "유통",
      price: "62,100",
      change: "+0.74%",
      volume: "894,200",
      ratio: "1.87",
      cap: "22.2",
      trade: "555",
    },
    {
      name: "금호석유",
      code: "011780",
      industry: "화학",
      price: "138,000",
      change: "+0.72%",
      volume: "661,900",
      ratio: "1.78",
      cap: "48.3",
      trade: "913",
    },
    {
      name: "오뚜기",
      code: "007310",
      industry: "음식료",
      price: "410,000",
      change: "+0.62%",
      volume: "1,635,700",
      ratio: "1.36",
      cap: "141.0",
      trade: "6,706",
    },
    {
      name: "대우건설",
      code: "047040",
      industry: "건설",
      price: "4,120",
      change: "+0.49%",
      volume: "824,200",
      ratio: "2.01",
      cap: "1.4",
      trade: "34",
    },
    {
      name: "KT",
      code: "030200",
      industry: "통신",
      price: "39,800",
      change: "+0.48%",
      volume: "1,218,800",
      ratio: "2.33",
      cap: "13.5",
      trade: "485",
    },
    {
      name: "SK텔레콤",
      code: "017670",
      industry: "통신",
      price: "55,000",
      change: "+0.36%",
      volume: "1,311,100",
      ratio: "2.70",
      cap: "19.5",
      trade: "721",
    },
    {
      name: "오리온",
      code: "271560",
      industry: "음식료",
      price: "92,000",
      change: "+0.34%",
      volume: "1,820,300",
      ratio: "2.10",
      cap: "32.6",
      trade: "1,675",
    },
    {
      name: "롯데케미칼",
      code: "011170",
      industry: "화학",
      price: "92,300",
      change: "-2.36%",
      volume: "458,100",
      ratio: "1.44",
      cap: "8.4",
      trade: "423",
    },
  ],
}

export function MoversPage() {
  const { query, setQuery } = useContext(HeaderSearchContext)
  const [industry, setIndustry] = useState("all")
  const [filter, setFilter] = useState("up")
  const [showWarning, setShowWarning] = useState(false)
  const [page, setPage] = useState(1)
  const industries = [...new Set(data.stocks.map((stock) => stock.industry))].toSorted()
  const filtered = data.stocks
    .filter((stock) => industry === "all" || stock.industry === industry)
    .filter((stock) =>
      (stock.name + " " + stock.code)
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
    )
    .filter(
      (stock) =>
        filter === "all" ||
        filter === "volume" ||
        (filter === "up" ? stock.change.startsWith("+") : stock.change.startsWith("-")),
    )
    .toSorted((a, b) =>
      filter === "volume"
        ? Number(b.volume.replaceAll(",", "")) - Number(a.volume.replaceAll(",", ""))
        : filter === "down"
          ? parseFloat(a.change) - parseFloat(b.change)
          : parseFloat(b.change) - parseFloat(a.change),
    )
  const pageCount = Math.max(1, Math.ceil(filtered.length / 20))
  const visible = filtered.slice(
    (Math.min(page, pageCount) - 1) * 20,
    Math.min(page, pageCount) * 20,
  )

  return (
    <>
      <main className="pt-9 pb-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-7">
          <div>
            <p className="typo-caption text-muted-foreground">시장 개요</p>
            <h1 className="mt-3 typo-page-title">주요 변동 종목</h1>
          </div>
          <p className="typo-caption text-muted-foreground">{data.asOf}</p>
        </div>
        <Tabs.Root defaultValue="domestic" className="mt-6 gap-0">
          <div className="flex flex-wrap items-center gap-4">
            <Tabs.List variant="segmented" aria-label="시장 선택">
              <Tabs.Trigger value="domestic">국내 시장</Tabs.Trigger>
              <Tabs.Trigger value="overseas">해외 시장</Tabs.Trigger>
            </Tabs.List>
            <span className="typo-body-sm text-muted-foreground">
              한국 주식 · KRW · 36개 예시 종목
            </span>
          </div>
          <Tabs.Content value="domestic">
            <section className="mt-8" aria-labelledby="movers-title">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 id="movers-title" className="typo-subheading">
                    오늘 크게 움직인 종목
                  </h2>
                  <p className="mt-1 typo-body-sm text-muted-foreground">
                    평소 거래량 대비: 직전 20거래일 평균 대비 배수 · 정규장 마감 기준
                  </p>
                </div>
                <fieldset className="inline-flex flex-wrap rounded-md bg-accent p-1">
                  <legend className="sr-only">변동 종목 필터</legend>
                  {[
                    ["all", "전체 종목"],
                    ["up", "상승 TOP"],
                    ["down", "하락 TOP"],
                    ["volume", "거래량 급증"],
                  ].map(([value, label]) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={filter === value ? "default" : "ghost"}
                      onClick={() => {
                        setFilter(value)
                        setPage(1)
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </fieldset>
              </div>
              <div className="mt-6 grid gap-4 rounded-lg bg-muted p-5 md:grid-cols-[minmax(0,1fr)_170px_auto] md:items-end">
                <div>
                  <label htmlFor="stock-search" className="typo-label-sm">
                    종목 검색
                  </label>
                  <Input
                    id="stock-search"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value)
                      setPage(1)
                    }}
                    placeholder="종목명 · 코드 · 티커"
                    className="mt-2 bg-background"
                  />
                </div>
                <div>
                  <label htmlFor="industry-filter" className="typo-label-sm">
                    산업
                  </label>
                  <Select.Root
                    value={industry}
                    onValueChange={(value) => {
                      setIndustry(value)
                      setPage(1)
                    }}
                  >
                    <Select.Trigger id="industry-filter" className="mt-2 w-full">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="all">전체 산업</Select.Item>
                      {industries.map((name) => (
                        <Select.Item value={name} key={name}>
                          {name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("")
                    setIndustry("all")
                    setPage(1)
                  }}
                >
                  검색·산업 초기화
                </Button>
              </div>
              <div className="mt-7 flex items-center justify-between gap-4 border-b border-border pb-4 typo-body-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Shield className="size-4 text-border" aria-hidden="true" /> 투자 유의 종목 거래소
                  지정 상태를 함께 표시합니다.
                </span>
                <Switch
                  checked={showWarning}
                  onCheckedChange={setShowWarning}
                  aria-label="투자 유의 종목 표시"
                />
              </div>
              <p className="my-4 typo-caption text-muted-foreground">
                {industry === "all" ? "전체 산업" : industry} ·{" "}
                {filter === "up"
                  ? "상승 TOP"
                  : filter === "down"
                    ? "하락 TOP"
                    : filter === "volume"
                      ? "거래량 급증"
                      : "전체 종목"}{" "}
                <strong className="text-foreground">{filtered.length}개</strong>
                {showWarning && " · 투자 유의 지정 예시 없음"}
              </p>
              <Table.Root className="min-w-6xl">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>순위</Table.Head>
                    <Table.Head>종목</Table.Head>
                    <Table.Head className="text-right">현재가</Table.Head>
                    <Table.Head className="text-right">등락률</Table.Head>
                    <Table.Head className="text-right">거래량</Table.Head>
                    <Table.Head className="text-right">평소 거래량 대비</Table.Head>
                    <Table.Head className="text-right">시가총액</Table.Head>
                    <Table.Head className="text-right">거래대금</Table.Head>
                    <Table.Head>변동 이유</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {visible.map((stock, index) => (
                    <Table.Row key={stock.code} className="h-17">
                      <Table.Cell className="text-muted-foreground">
                        {(page - 1) * 20 + index + 1}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent typo-label text-primary">
                            {stock.name.slice(0, 1)}
                          </span>
                          <span>
                            <span className="block typo-table-label">
                              {stock.code === "005380" ? (
                                <Link
                                  to="/stocks/$code"
                                  params={{ code: stock.code }}
                                  className="hover:text-primary hover:underline"
                                >
                                  {stock.name}
                                </Link>
                              ) : (
                                stock.name
                              )}
                            </span>
                            <span className="block typo-caption text-muted-foreground">
                              {stock.code} · {stock.industry}
                            </span>
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-right tabular-nums">{stock.price}원</Table.Cell>
                      <Table.Cell
                        className={
                          stock.change.startsWith("+")
                            ? "text-right text-positive tabular-nums"
                            : "text-right text-negative tabular-nums"
                        }
                      >
                        {stock.change}
                      </Table.Cell>
                      <Table.Cell className="text-right tabular-nums">{stock.volume}주</Table.Cell>
                      <Table.Cell className="text-right">
                        <span className="bg-accent px-2 py-1 text-primary tabular-nums">
                          {stock.ratio}배
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-right tabular-nums">{stock.cap}조원</Table.Cell>
                      <Table.Cell className="text-right tabular-nums">{stock.trade}억원</Table.Cell>
                      <Table.Cell className="text-muted-foreground">
                        수요 및 실적 개선 기대 · 예시
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {visible.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={9} className="py-12 text-center text-muted-foreground">
                        검색 결과가 없습니다.
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
              <Pagination.Root className="mt-6">
                <Pagination.Content>
                  <Pagination.Item>
                    <Pagination.Previous disabled={page <= 1} onClick={() => setPage(page - 1)} />
                  </Pagination.Item>
                  <Pagination.Item>
                    <Pagination.Status>
                      {Math.min(page, pageCount)} / {pageCount}
                    </Pagination.Status>
                  </Pagination.Item>
                  <Pagination.Item>
                    <Pagination.Next
                      disabled={page >= pageCount}
                      onClick={() => setPage(page + 1)}
                    />
                  </Pagination.Item>
                </Pagination.Content>
              </Pagination.Root>
              <p className="mt-4 typo-helper text-muted-foreground">
                현대차 종목명을 누르면 상세 정보를 볼 수 있어요. 최대 100개를 20개씩 표시하며
                시가총액·거래대금은 디자인용 예시입니다.
              </p>
            </section>
          </Tabs.Content>
          <Tabs.Content
            value="overseas"
            className="py-20 text-center typo-body-sm text-muted-foreground"
          >
            해외 시장 데모 데이터는 준비 중입니다.
          </Tabs.Content>
        </Tabs.Root>
        <p className="mt-10 typo-helper text-muted-foreground">
          DEMO 모든 가격·그래프·뉴스는 디자인용 예시입니다. 실제 시세 또는 투자 예측이 아닙니다.
        </p>
        <p className="mt-6 typo-helper text-muted-foreground">
          실제 거래·알림 발송을 지원하지 않는 디자인 프로토타입입니다. 투자 판단에 사용하지 마세요.
        </p>
      </main>
    </>
  )
}
