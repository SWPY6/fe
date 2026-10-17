/* oxlint-disable jsx-a11y/prefer-tag-over-role -- 자동 생성 스켈레톤의 div 래퍼를 수용하면서 표 의미를 유지하기 위해 ARIA 표를 사용한다. */
import { Suspense } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import { QueryErrorResetBoundary } from "@tanstack/react-query"
import { Link, getRouteApi } from "@tanstack/react-router"
import { useDebouncedValue } from "react-simplikit"

import { getReadMoversSuspenseQueryOptions } from "@/api/generated/api"
import { ApiError } from "@/api/http/error"
import { getErrorDescription } from "@/api/query/errorPolicy"
import { PriceNumber } from "@/components/domain/PriceNumber"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { QueryErrorBoundary } from "@/components/ui/QueryErrorBoundary"
import { Result } from "@/components/ui/Result"
import { Select } from "@/components/ui/select"
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

export function MoversPage() {
  const [{ market }] = useGlobalUrlState()
  const { q, industry, sort, page } = route.useSearch()
  const navigate = route.useNavigate()
  const debouncedQ = useDebouncedValue(q, 200)

  return (
    <main className="py-8">
      <section aria-labelledby="movers-title" className="flex flex-col gap-6">
        <h1 id="movers-title" className="typo-section-heading">
          주요 변동 종목
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <fieldset
            aria-label="시장 선택"
            className="flex flex-wrap gap-1 rounded-md bg-accent p-1"
          >
            <Button
              type="button"
              size="sm"
              variant={market === "domestic" ? "default" : "ghost"}
              aria-pressed={market === "domestic"}
              onClick={() =>
                navigate({
                  search: (previous) => ({ ...previous, market: "domestic", page: 1 }),
                  replace: true,
                  resetScroll: false,
                })
              }
            >
              국내 시장
            </Button>
            <Button
              type="button"
              size="sm"
              variant={market === "overseas" ? "default" : "ghost"}
              aria-pressed={market === "overseas"}
              onClick={() =>
                navigate({
                  search: (previous) => ({ ...previous, market: "overseas", page: 1 }),
                  replace: true,
                  resetScroll: false,
                })
              }
            >
              해외 시장
            </Button>
          </fieldset>
          <span aria-hidden="true" className="hidden h-5 w-px bg-border md:block" />
          <fieldset
            aria-label="변동 종목 조건"
            className="flex min-w-0 flex-wrap gap-1 rounded-md bg-accent p-1"
          >
            {moversFilterSchema.options.map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={sort === value ? "default" : "ghost"}
                aria-pressed={sort === value}
                onClick={() => {
                  navigate({
                    search: (previous) => ({
                      ...previous,
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
              navigate({
                search: (previous) => ({
                  ...previous,
                  page: 1,
                }),
                replace: true,
              })
            }}
          >
            <div className="flex gap-2">
              <Input
                id="stock-search"
                aria-label="종목 검색"
                name="query"
                type="search"
                value={q ?? ""}
                placeholder="종목명 또는 종목코드"
                onChange={({ currentTarget: { value } }) =>
                  navigate({
                    search: (previous) => ({ ...previous, q: value || undefined, page: 1 }),
                    replace: true,
                    resetScroll: false,
                  })
                }
              />
              <Button type="submit">검색</Button>
            </div>
          </form>
          <div>
            <Select.Root
              value={industry ?? "all"}
              onValueChange={(value) => {
                navigate({
                  search: (previous) => ({
                    ...previous,
                    industry: value === "all" ? undefined : moverIndustrySchema.parse(value),
                    page: 1,
                  }),
                  replace: true,
                  resetScroll: false,
                })
              }}
            >
              <Select.Trigger id="industry-filter" aria-label="산업 필터">
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
        <QueryErrorResetBoundary>
          <QueryErrorBoundary
            shouldCatch={ApiError}
            resetKeys={[market, sort, industry, debouncedQ?.trim() || undefined]}
            fallback={({ error, reset }) => (
              <Result
                role="alert"
                title="종목 목록을 불러오지 못했습니다"
                description={getErrorDescription(error)}
                button={<Result.Button onClick={reset}>다시 시도</Result.Button>}
              />
            )}
          >
            <div className="overflow-x-auto">
              <div role="table" aria-labelledby="movers-title" className="min-w-6xl">
                <div role="rowgroup" className="bg-muted">
                  <div
                    role="row"
                    className="grid grid-cols-[4rem_minmax(12rem,2fr)_minmax(7rem,1fr)_minmax(5rem,.7fr)_minmax(7rem,1fr)_minmax(10rem,1.4fr)_minmax(10rem,1.4fr)_5rem] items-center border-b border-border"
                  >
                    <div
                      role="columnheader"
                      className="px-2.5 py-2 typo-table-header text-muted-foreground"
                    >
                      <span className="inline-block">순위</span>
                    </div>
                    <div
                      role="columnheader"
                      className="px-2.5 py-2 typo-table-header text-muted-foreground"
                    >
                      <span className="inline-block">종목</span>
                    </div>
                    <div
                      role="columnheader"
                      className="px-2.5 py-2 text-right typo-table-header text-muted-foreground"
                    >
                      <span className="inline-block">현재가</span>
                    </div>
                    <div
                      role="columnheader"
                      className="px-2.5 py-2 text-right typo-table-header text-muted-foreground"
                    >
                      <span className="inline-block">등락률</span>
                    </div>
                    <div
                      role="columnheader"
                      className="px-2.5 py-2 text-right typo-table-header text-muted-foreground"
                    >
                      <span className="inline-block">거래량</span>
                    </div>
                    <div
                      role="columnheader"
                      className="px-2.5 py-2 text-right typo-table-header text-muted-foreground"
                    >
                      <span className="inline-block">시가총액</span>
                    </div>
                    <div
                      role="columnheader"
                      className="px-2.5 py-2 text-right typo-table-header text-muted-foreground"
                    >
                      <span className="inline-block">거래대금</span>
                    </div>
                    <div
                      role="columnheader"
                      className="px-2.5 py-2 typo-table-header text-muted-foreground"
                    >
                      <span className="inline-block">산업</span>
                    </div>
                  </div>
                </div>
                <Suspense data-skeleton>
                  <SuspenseQuery
                    {...getReadMoversSuspenseQueryOptions({
                      country: market === "domestic" ? "KR" : "US",
                      condition: conditionBySort[sort],
                      industry,
                      query: debouncedQ?.trim() || undefined,
                    })}
                  >
                    {({ data: response }) => {
                      const stocks = response.data?.stocks
                      if (!Array.isArray(stocks)) throw new Error("종목 목록을 확인할 수 없습니다.")
                      const pageSize = 20
                      const currentPage = Math.min(
                        page,
                        Math.max(1, Math.ceil(stocks.length / pageSize)),
                      )
                      if (stocks.length === 0)
                        return (
                          <div role="rowgroup">
                            <div role="row">
                              <div role="cell" aria-colspan={8} className="py-4">
                                검색 결과가 없습니다.
                              </div>
                            </div>
                          </div>
                        )
                      return (
                        <div role="rowgroup">
                          {stocks
                            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                            .map((stock, index) => (
                              <div
                                role="row"
                                className="relative grid grid-cols-[4rem_minmax(12rem,2fr)_minmax(7rem,1fr)_minmax(5rem,.7fr)_minmax(7rem,1fr)_minmax(10rem,1.4fr)_minmax(10rem,1.4fr)_5rem] items-center border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                                key={`${stock.ticker ?? stock.name ?? "unknown"}-${stock.stockId ?? "none"}`}
                              >
                                <div
                                  role="cell"
                                  className="px-2.5 py-2 typo-table-value whitespace-nowrap"
                                >
                                  <span className="inline-block">
                                    {(currentPage - 1) * pageSize + index + 1}
                                  </span>
                                </div>
                                <div
                                  role="cell"
                                  className="px-2.5 py-2 typo-table-value whitespace-nowrap"
                                >
                                  {stock.stockId != null ? (
                                    <Link
                                      className="after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-ring"
                                      to="/stocks/$stockId"
                                      params={{ stockId: String(stock.stockId) }}
                                    >
                                      {stock.name ?? "이름 없음"}
                                    </Link>
                                  ) : (
                                    <span>{stock.name ?? "이름 없음"}</span>
                                  )}
                                  <span className="block w-fit text-muted-foreground">
                                    {stock.ticker ?? "—"}
                                  </span>
                                </div>
                                <div
                                  role="cell"
                                  className="px-2.5 py-2 text-right typo-table-value whitespace-nowrap"
                                >
                                  <span className="inline-block">
                                    {stock.price == null
                                      ? "—"
                                      : stock.price.toLocaleString("ko-KR")}
                                  </span>
                                </div>
                                <div
                                  role="cell"
                                  className="px-2.5 py-2 text-right typo-table-value whitespace-nowrap"
                                >
                                  <span className="inline-block">
                                    {stock.changeRate == null ? (
                                      "—"
                                    ) : (
                                      <PriceNumber
                                        value={stock.changeRate}
                                        format={{
                                          style: "unit",
                                          unit: "percent",
                                          signDisplay: "exceptZero",
                                        }}
                                      />
                                    )}
                                  </span>
                                </div>
                                <div
                                  role="cell"
                                  className="px-2.5 py-2 text-right typo-table-value whitespace-nowrap"
                                >
                                  <span className="inline-block">
                                    {stock.volume == null
                                      ? "—"
                                      : stock.volume.toLocaleString("ko-KR")}
                                  </span>
                                </div>
                                <div
                                  role="cell"
                                  className="px-2.5 py-2 text-right typo-table-value whitespace-nowrap"
                                >
                                  <span className="inline-block">
                                    {stock.marketCap == null
                                      ? "—"
                                      : stock.marketCap.toLocaleString("ko-KR")}
                                  </span>
                                </div>
                                <div
                                  role="cell"
                                  className="px-2.5 py-2 text-right typo-table-value whitespace-nowrap"
                                >
                                  <span className="inline-block">
                                    {stock.tradingValue == null
                                      ? "—"
                                      : stock.tradingValue.toLocaleString("ko-KR")}
                                  </span>
                                </div>
                                <div
                                  role="cell"
                                  className="px-2.5 py-2 typo-table-value whitespace-nowrap"
                                >
                                  {stock.industry == null ? (
                                    "—"
                                  ) : (
                                    <Badge>{industryLabelByCode[stock.industry]}</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )
                    }}
                  </SuspenseQuery>
                </Suspense>
              </div>
            </div>
            <Suspense fallback={null}>
              <SuspenseQuery
                {...getReadMoversSuspenseQueryOptions({
                  country: market === "domestic" ? "KR" : "US",
                  condition: conditionBySort[sort],
                  industry,
                  query: debouncedQ?.trim() || undefined,
                })}
              >
                {({ data: response }) => {
                  const stocks = response.data?.stocks
                  if (!Array.isArray(stocks) || stocks.length === 0) return null
                  const totalPages = Math.max(1, Math.ceil(stocks.length / 20))
                  const currentPage = Math.min(page, totalPages)
                  return (
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
                  )
                }}
              </SuspenseQuery>
            </Suspense>
          </QueryErrorBoundary>
        </QueryErrorResetBoundary>
      </section>
    </main>
  )
}
