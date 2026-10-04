import { ErrorBoundary, Suspense } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import { Link, getRouteApi } from "@tanstack/react-router"
import { Star } from "lucide-react"
import { Separated, useStorageState } from "react-simplikit"

import { getQuoteSuspenseQueryOptions, getSummarySuspenseQueryOptions } from "@/api/generated/api"
import { PriceNumber } from "@/components/domain/PriceNumber"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { StockChartSection } from "./-components/StockChartSection"
import { StockMaterialsSection } from "./-components/StockMaterialsSection"

const route = getRouteApi("/_layout/stocks/$stockId/")

export function StockPage() {
  const stockId = route.useParams({ select: (params) => params.stockId })
  const [watchlistStockIds, setWatchlistStockIds] = useStorageState<string[]>(
    "watchlist-stock-ids",
    { defaultValue: [] },
  )
  const isWatchlisted = watchlistStockIds.includes(stockId)

  return (
    <main className="flex flex-col gap-8 py-8">
      <Separated by={<Separator />}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="typo-section-heading">종목 상세</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-pressed={isWatchlisted}
              onClick={() =>
                setWatchlistStockIds((stockIds) =>
                  stockIds.includes(stockId)
                    ? stockIds.filter((id) => id !== stockId)
                    : [...stockIds, stockId],
                )
              }
            >
              <Star aria-hidden="true" fill={isWatchlisted ? "currentColor" : "none"} />
              {isWatchlisted ? "관심종목 해제" : "관심종목 추가"}
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/movers">다른 종목 찾기</Link>
            </Button>
          </div>
        </div>
        <section
          aria-label="종목 요약 정보"
          className="flex flex-wrap items-center gap-x-12 gap-y-5"
        >
          <ErrorBoundary key={`identity-${stockId}`} fallback="오류가 발생했습니다">
            <Suspense fallback="로딩중">
              <SuspenseQuery {...getSummarySuspenseQueryOptions(Number(stockId))}>
                {({ data: response }) => (
                  <div>
                    <h2 className="typo-subheading">{response.data.profile?.name ?? "—"}</h2>
                    <p className="mt-1 typo-body-sm text-muted-foreground">
                      {response.data.profile?.ticker} · {response.data.country} ·{" "}
                      {response.data.currency}
                    </p>
                    <p className="mt-1 typo-body-sm text-muted-foreground">
                      {response.data.profile?.industries
                        ?.map((industry) => industry.name)
                        .join(" · ") || "연결된 산업이 없습니다"}
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
        <StockChartSection />
        <StockMaterialsSection key={stockId} />
      </Separated>
    </main>
  )
}
