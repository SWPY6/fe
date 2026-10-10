import { ErrorBoundary, Suspense } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import type { IChartApi } from "lightweight-charts"

import { getChart1SuspenseQueryOptions } from "@/api/generated/api"
import { TradingChart } from "@/components/ui/chart"

const chartIndicators = ["KOSPI", "KOSDAQ", "NASDAQ", "SP500", "USD_KRW"] as const
type ChartIndicator = (typeof chartIndicators)[number]

export function isChartIndicator(value: string | undefined): value is ChartIndicator {
  return chartIndicators.some((indicator) => indicator === value)
}

function fitContent(chart: IChartApi | null) {
  chart?.timeScale().fitContent()
}

export function MarketIndicatorChart({ indicator }: { indicator: ChartIndicator }) {
  return (
    <ErrorBoundary key={indicator} fallback="차트를 불러오지 못했습니다.">
      <Suspense fallback="차트를 불러오는 중입니다.">
        <SuspenseQuery {...getChart1SuspenseQueryOptions(indicator)}>
          {({ data: response }) => {
            const candles = response.data.candles ?? []
            if (candles.length === 0) {
              return <p>선택한 기간의 차트 자료가 없습니다.</p>
            }

            const lineData = candles.map(({ tradeAt, close }) => ({
              time: tradeAt,
              value: close,
            }))

            return (
              <TradingChart.Root
                ref={fitContent}
                className="mt-5 h-44 w-full"
                aria-label={`${indicator} 선 그래프`}
              >
                <TradingChart.Line data={lineData} />
              </TradingChart.Root>
            )
          }}
        </SuspenseQuery>
      </Suspense>
    </ErrorBoundary>
  )
}
