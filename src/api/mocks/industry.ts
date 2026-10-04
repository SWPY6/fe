import { getRelatedNewsResponseMock } from "../generated/api.msw"
import { IndustryNewsResponseDirection, IndustryTrendResponseCode } from "../generated/api.schemas"
import type {
  IndustryFlowResponse,
  IndustryNewsResponse,
  IndustryTrendResponse,
  ReadTrendsCountry,
  ReadTrendsFilter,
} from "../generated/api.schemas"
import { markets } from "./market"
import type { Stock } from "./stock"

export const industryNames = {
  AUTOMOBILE: "자동차",
  CONSTRUCTION: "건설",
  TRANSPORT: "운송",
  RETAIL: "유통",
  FOOD_BEVERAGE: "음식료",
  TELECOM: "통신",
  STEEL: "철강",
  ENERGY: "에너지",
  CHEMICAL: "화학",
} satisfies Record<IndustryTrendResponseCode, string>

export function industrySnapshot(stocks: Stock[], country: ReadTrendsCountry) {
  const ranked = Object.values(IndustryTrendResponseCode)
    .map((code) => {
      const members = stocks.filter(
        (stock) => stock.country === country && stock.item.industryCode === code,
      )
      const items = members
        .map((stock) => stock.item)
        .toSorted((a, b) => b.indicators.marketCap - a.indicators.marketCap)
      const average = items.length
        ? items.reduce(
            (sum, stock) => sum + (stock.change / stock.indicators.previousClose) * 100,
            0,
          ) / items.length
        : 0
      return {
        code,
        displayName: industryNames[code],
        average,
        avgChangeRate: Number(average.toFixed(2)),
        stockCount: items.length,
        risingCount: items.filter((stock) => stock.change > 0).length,
        fallingCount: items.filter((stock) => stock.change < 0).length,
        tradingValue: items.reduce((sum, stock) => sum + stock.indicators.tradingValue, 0),
        averageTradingValue20d: members.reduce(
          (sum, stock) => sum + stock.averageTradingValue20d,
          0,
        ),
        calculatedAt: items.length ? markets[country].priceAt : null,
        items,
      }
    })
    .toSorted(
      (a, b) =>
        b.average - a.average || b.tradingValue - a.tradingValue || a.code.localeCompare(b.code),
    )
    .map((industry, index) => Object.assign(industry, { rank: index + 1 }))

  const flows = ranked.map(
    ({ code, displayName, rank, avgChangeRate, stockCount, calculatedAt, items }) =>
      ({
        code,
        displayName,
        rank,
        avgChangeRate,
        stockCount,
        calculatedAt,
        majorStocks: items
          .slice(0, 2)
          .map(({ stockId, ticker, name, changeRate }) => ({ stockId, ticker, name, changeRate })),
      }) satisfies IndustryFlowResponse,
  )

  const news = Object.values(IndustryNewsResponseDirection).map((direction) => {
    const ordered = direction === "RISING" ? ranked : ranked.toReversed()
    const candidates = ordered.filter((industry) =>
      direction === "RISING" ? industry.average > 0 : industry.average < 0,
    )
    const selected =
      candidates.find((industry) => industry.tradingValue >= industry.averageTradingValue20d) ??
      candidates[0] ??
      ordered[0]
    const {
      code,
      displayName,
      rank,
      avgChangeRate,
      stockCount,
      risingCount,
      fallingCount,
      calculatedAt,
    } = selected
    return {
      code,
      displayName,
      direction,
      rank,
      avgChangeRate,
      stockCount,
      risingCount,
      fallingCount,
      calculatedAt,
      news:
        calculatedAt && rank % 2 === 1
          ? [
              getRelatedNewsResponseMock({
                title: `[모의 뉴스] ${displayName} 업계 동향`,
                publishedAt: calculatedAt,
              }),
            ]
          : [],
    } satisfies IndustryNewsResponse
  })

  function trends(filter: ReadTrendsFilter) {
    const selected =
      filter === "ALL"
        ? ranked.toSorted((a, b) => a.displayName.localeCompare(b.displayName, "ko"))
        : filter === "RISING"
          ? ranked.filter((industry) => industry.average > 0)
          : ranked.filter((industry) => industry.average < 0).toReversed()
    return selected.map(
      ({ code, displayName, rank, avgChangeRate, stockCount, calculatedAt, items }) =>
        ({
          code,
          displayName,
          rank,
          avgChangeRate,
          stockCount,
          calculatedAt,
          currency: markets[country].currency,
          stocks: items.slice(0, 4).map(({ stockId, ticker, name, price, changeRate }) => ({
            stockId,
            ticker,
            name,
            price,
            changeRate,
          })),
        }) satisfies IndustryTrendResponse,
    )
  }

  return { flows, news, trends }
}
