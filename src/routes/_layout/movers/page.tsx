import { ErrorBoundary, Suspense, type ErrorBoundaryFallbackProps } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { Link, getRouteApi } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import { useDebounce } from "react-simplikit"

import { getReadMoversQueryKey, getReadMoversSuspenseQueryOptions } from "@/api/generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Select } from "@/components/ui/select"
import { Table } from "@/components/ui/table"
import { useGlobalUrlState } from "@/hooks/useGlobalUrlState"

import { moverIndustrySchema, moversFilterSchema } from "./-schema"

const route = getRouteApi("/_layout/movers/")
const conditionBySort = {
  ALL: "ALL",
  UP: "RISING",
  DOWN: "FALLING",
  VOLUME: "VOLUME_SURGE",
} as const

const labelBySort = {
  ALL: "전체 종목",
  UP: "상승 TOP",
  DOWN: "하락 TOP",
  VOLUME: "거래량 급증",
} as const

const industryLabelByCode = {
  AUTOMOBILE: "자동차",
  CONSTRUCTION: "건설",
  TRANSPORT: "운송",
  RETAIL: "유통",
  FOOD_BEVERAGE: "음식료",
  TELECOM: "통신",
  STEEL: "철강",
  ENERGY: "에너지",
  CHEMICAL: "화학",
} satisfies Record<(typeof moverIndustrySchema.options)[number], string>

function MoversErrorFallback({ reset }: ErrorBoundaryFallbackProps) {
  return (
    <div className="flex items-center gap-3">
      <p>종목을 불러오지 못했습니다.</p>
      <Button type="button" variant="outline" onClick={reset}>
        다시 시도
      </Button>
    </div>
  )
}

export function MoversPage() {
  const [{ market }] = useGlobalUrlState()
  const { q, industry, sort, page } = route.useSearch()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()
  const moverParams = {
    country: market === "domestic" ? "KR" : "US",
    condition: conditionBySort[sort],
    industry,
    query: q?.trim() || undefined,
  } as const
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isComposing = useRef(false)
  const hasPendingSearch = useRef(false)
  const searchAfterTyping = useDebounce((value: string) => {
    hasPendingSearch.current = false
    navigate({
      search: (previous) => ({ ...previous, q: value.trim() || undefined, page: 1 }),
      replace: true,
    })
  }, 200)

  const switchMarket = (nextMarket: "domestic" | "overseas") => {
    searchAfterTyping.cancel()
    hasPendingSearch.current = false
    navigate({
      search: (previous) => ({
        ...previous,
        q: searchInputRef.current?.value.trim() || undefined,
        market: nextMarket,
        page: 1,
      }),
      replace: true,
      resetScroll: false,
    })
  }

  useEffect(
    function syncSearchInputFromUrl() {
      if (isComposing.current || hasPendingSearch.current) return
      if (searchInputRef.current) searchInputRef.current.value = q ?? ""
    },
    [q],
  )

  useEffect(
    function syncSearchAfterBrowserHistory() {
      const restoreSearchInput = () => {
        searchAfterTyping.cancel()
        hasPendingSearch.current = false
        if (searchInputRef.current) {
          searchInputRef.current.value = new URLSearchParams(window.location.search).get("q") ?? ""
        }
      }
      window.addEventListener("popstate", restoreSearchInput)
      return () => window.removeEventListener("popstate", restoreSearchInput)
    },
    [searchAfterTyping],
  )

  return (
    <main className="py-8">
      <section aria-labelledby="movers-title" className="flex flex-col gap-6">
        <h1 id="movers-title" className="typo-section-heading">
          주요 변동 종목
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <fieldset aria-label="시장 선택" className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={market === "domestic" ? "default" : "ghost"}
              onClick={() => switchMarket("domestic")}
            >
              국내 시장
            </Button>
            <Button
              type="button"
              size="sm"
              variant={market === "overseas" ? "default" : "ghost"}
              onClick={() => switchMarket("overseas")}
            >
              해외 시장
            </Button>
          </fieldset>
          <span aria-hidden="true" className="hidden h-5 w-px bg-border md:block" />
          <fieldset aria-label="변동 종목 조건" className="flex min-w-0 flex-wrap gap-2">
            {moversFilterSchema.options.map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={sort === value ? "default" : "ghost"}
                onClick={() => {
                  searchAfterTyping.cancel()
                  hasPendingSearch.current = false
                  navigate({
                    search: (previous) => ({
                      ...previous,
                      q: searchInputRef.current?.value.trim() || undefined,
                      sort: value,
                      page: 1,
                    }),
                    replace: true,
                  })
                }}
              >
                {labelBySort[value]}
              </Button>
            ))}
          </fieldset>
        </div>
        <div className="flex flex-wrap gap-4">
          <form
            className="min-w-48 flex-1"
            onSubmit={(event) => {
              event.preventDefault()
              if (isComposing.current) return
              searchAfterTyping.cancel()
              hasPendingSearch.current = false
              navigate({
                search: (previous) => ({
                  ...previous,
                  q: searchInputRef.current?.value.trim() || undefined,
                  page: 1,
                }),
                replace: true,
              })
            }}
          >
            <label htmlFor="stock-search">종목 검색</label>
            <div className="flex gap-2">
              <Input
                ref={searchInputRef}
                id="stock-search"
                name="query"
                type="search"
                defaultValue={q ?? ""}
                placeholder="종목명 또는 종목코드"
                onChange={(event) => {
                  hasPendingSearch.current = true
                  searchAfterTyping(event.currentTarget.value)
                }}
                onCompositionStart={() => {
                  isComposing.current = true
                  hasPendingSearch.current = true
                  searchAfterTyping.cancel()
                }}
                onCompositionEnd={(event) => {
                  isComposing.current = false
                  hasPendingSearch.current = true
                  searchAfterTyping(event.currentTarget.value)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && event.nativeEvent.isComposing) event.preventDefault()
                }}
              />
              <Button type="submit" variant="outline">
                검색
              </Button>
            </div>
          </form>
          <div>
            <label htmlFor="industry-filter">산업</label>
            <Select.Root
              value={industry ?? "all"}
              onValueChange={(value) => {
                const selected = moverIndustrySchema.safeParse(value)
                searchAfterTyping.cancel()
                hasPendingSearch.current = false
                navigate({
                  search: (previous) => ({
                    ...previous,
                    q: searchInputRef.current?.value.trim() || undefined,
                    industry: selected.success ? selected.data : undefined,
                    page: 1,
                  }),
                  replace: true,
                })
              }}
            >
              <Select.Trigger id="industry-filter">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">전체 산업</Select.Item>
                {moverIndustrySchema.options.map((value) => (
                  <Select.Item key={value} value={value}>
                    {industryLabelByCode[value]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
        </div>
        <ErrorBoundary
          key={[market, sort, industry ?? "", q ?? ""].join("|")}
          fallback={MoversErrorFallback}
          onReset={() =>
            queryClient.removeQueries({ queryKey: getReadMoversQueryKey(moverParams), exact: true })
          }
        >
          <Suspense fallback={<p>종목을 불러오는 중입니다.</p>}>
            <SuspenseQuery {...getReadMoversSuspenseQueryOptions(moverParams)}>
              {({ data: response }) => {
                const stocks = response.data?.stocks
                if (!Array.isArray(stocks)) throw new Error("종목 목록을 확인할 수 없습니다.")
                const pageSize = 20
                const totalPages = Math.max(1, Math.ceil(stocks.length / pageSize))
                const currentPage = Math.min(page, totalPages)
                const visibleStocks = stocks.slice(
                  (currentPage - 1) * pageSize,
                  currentPage * pageSize,
                )
                if (stocks.length === 0)
                  return (
                    <div className="flex flex-col items-start gap-3">
                      <p>검색 결과가 없습니다.</p>
                    </div>
                  )

                return (
                  <>
                    <Table.Root aria-labelledby="movers-title" className="min-w-4xl">
                      <Table.Header>
                        <Table.Row>
                          <Table.Head>순위</Table.Head>
                          <Table.Head>종목</Table.Head>
                          <Table.Head className="text-right">현재가</Table.Head>
                          <Table.Head className="text-right">등락률</Table.Head>
                          <Table.Head className="text-right">거래량</Table.Head>
                          <Table.Head className="text-right">시가총액</Table.Head>
                          <Table.Head className="text-right">거래대금</Table.Head>
                          <Table.Head>산업</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {visibleStocks.map((stock, index) => (
                          <Table.Row
                            key={`${stock.ticker ?? stock.name ?? "unknown"}-${stock.stockId ?? "none"}`}
                          >
                            <Table.Cell>{(currentPage - 1) * pageSize + index + 1}</Table.Cell>
                            <Table.Cell>
                              {stock.stockId != null ? (
                                <Link
                                  to="/stocks/$stockId"
                                  params={{ stockId: String(stock.stockId) }}
                                >
                                  {stock.name ?? "이름 없음"}
                                </Link>
                              ) : (
                                <span>{stock.name ?? "이름 없음"}</span>
                              )}
                              <span className="block text-muted-foreground">
                                {stock.ticker ?? "—"}
                              </span>
                            </Table.Cell>
                            <Table.Cell className="text-right">
                              {stock.price == null ? "—" : stock.price.toLocaleString("ko-KR")}
                            </Table.Cell>
                            <Table.Cell className="text-right">
                              {stock.changeRate == null ? "—" : `${stock.changeRate}%`}
                            </Table.Cell>
                            <Table.Cell className="text-right">
                              {stock.volume == null ? "—" : stock.volume.toLocaleString("ko-KR")}
                            </Table.Cell>
                            <Table.Cell className="text-right">
                              {stock.marketCap == null
                                ? "—"
                                : stock.marketCap.toLocaleString("ko-KR")}
                            </Table.Cell>
                            <Table.Cell className="text-right">
                              {stock.tradingValue == null
                                ? "—"
                                : stock.tradingValue.toLocaleString("ko-KR")}
                            </Table.Cell>
                            <Table.Cell>
                              {stock.industry == null ? "—" : industryLabelByCode[stock.industry]}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                    <Pagination.Root className="mt-6">
                      <Pagination.Content>
                        <Pagination.Item>
                          <Pagination.Previous
                            disabled={currentPage <= 1}
                            onClick={() =>
                              navigate({
                                search: (previous) => ({ ...previous, page: currentPage - 1 }),
                              })
                            }
                          />
                        </Pagination.Item>
                        <Pagination.Item>
                          <Pagination.Status>
                            {currentPage} / {totalPages}
                          </Pagination.Status>
                        </Pagination.Item>
                        <Pagination.Item>
                          <Pagination.Next
                            disabled={currentPage >= totalPages}
                            onClick={() =>
                              navigate({
                                search: (previous) => ({ ...previous, page: currentPage + 1 }),
                              })
                            }
                          />
                        </Pagination.Item>
                      </Pagination.Content>
                    </Pagination.Root>
                  </>
                )
              }}
            </SuspenseQuery>
          </Suspense>
        </ErrorBoundary>
      </section>
    </main>
  )
}
