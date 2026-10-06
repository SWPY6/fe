import { ErrorBoundary } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import { Link, getRouteApi } from "@tanstack/react-router"
import { BoneSuspense } from "boneyard-js/react"
import { Star } from "lucide-react"
import type { CSSProperties } from "react"
import { Separated, useStorageState } from "react-simplikit"

import { getQuoteSuspenseQueryOptions, getSummarySuspenseQueryOptions } from "@/api/generated/api"
import { PriceNumber } from "@/components/domain/PriceNumber"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import stockQuoteBones from "./-components/stock-quote.bones.json"
import stockSummaryBones from "./-components/stock-summary.bones.json"
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
          <div
            style={
              {
                "--loading-width": `${stockSummaryBones.breakpoints[375].width}px`,
                "--loading-width-sm": `${stockSummaryBones.breakpoints[640].width}px`,
                "--loading-width-md": `${stockSummaryBones.breakpoints[768].width}px`,
                "--loading-width-lg": `${stockSummaryBones.breakpoints[1024].width}px`,
                "--loading-width-xl": `${stockSummaryBones.breakpoints[1280].width}px`,
              } as CSSProperties
            }
            className="has-aria-busy:w-(--loading-width) has-aria-busy:max-w-full sm:has-aria-busy:w-(--loading-width-sm) md:has-aria-busy:w-(--loading-width-md) lg:has-aria-busy:w-(--loading-width-lg) xl:has-aria-busy:w-(--loading-width-xl)"
          >
            <ErrorBoundary key={`identity-${stockId}`} fallback="오류가 발생했습니다">
              <BoneSuspense
                name="stock-summary"
                className="w-full"
                select="viewport"
                initialBones={stockSummaryBones}
              >
                <SuspenseQuery {...getSummarySuspenseQueryOptions(Number(stockId))}>
                  {({ data: response }) => (
                    <>
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
                    </>
                  )}
                </SuspenseQuery>
              </BoneSuspense>
            </ErrorBoundary>
          </div>
          <div
            style={
              {
                "--loading-width": `${stockQuoteBones.breakpoints[375].width}px`,
                "--loading-width-sm": `${stockQuoteBones.breakpoints[640].width}px`,
                "--loading-width-md": `${stockQuoteBones.breakpoints[768].width}px`,
                "--loading-width-lg": `${stockQuoteBones.breakpoints[1024].width}px`,
                "--loading-width-xl": `${stockQuoteBones.breakpoints[1280].width}px`,
              } as CSSProperties
            }
            className="has-aria-busy:w-(--loading-width) has-aria-busy:max-w-full sm:has-aria-busy:w-(--loading-width-sm) md:has-aria-busy:w-(--loading-width-md) lg:has-aria-busy:w-(--loading-width-lg) xl:has-aria-busy:w-(--loading-width-xl)"
          >
            <ErrorBoundary key={`quote-${stockId}`} fallback="오류가 발생했습니다">
              <BoneSuspense
                name="stock-quote"
                className="w-full"
                select="viewport"
                initialBones={stockQuoteBones}
              >
                <SuspenseQuery {...getQuoteSuspenseQueryOptions(Number(stockId))}>
                  {({ data: response }) => (
                    <>
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
                    </>
                  )}
                </SuspenseQuery>
              </BoneSuspense>
            </ErrorBoundary>
          </div>
        </section>
        <StockChartSection />
        <StockMaterialsSection key={stockId} />
      </Separated>
    </main>
  )
}
