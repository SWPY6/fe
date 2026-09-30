import { queryOptions } from "@tanstack/react-query"

import { getMarketIndustries, getPinnedIndustries } from "@/api/generated/api"
import type { Market } from "@/api/generated/api.schemas"

export const industriesQueryOptions = (market: Market) =>
  queryOptions({
    queryKey: ["industries", market],
    queryFn: ({ signal }) => getMarketIndustries(market, { signal }),
    select: ({ data: response }) => ({
      market: response.market,
      asOf: response.asOf,
      industries: response.industries.map((industry) => ({
        id: industry.industryId,
        name: industry.name,
        averageChangeRate: industry.averageChangeRate,
        displayChangeRate: industry.displayChangeRate,
        rank: industry.rank,
        stockCount: industry.stockCount,
        tradingValueChangeRate: industry.tradingValueChangeRate,
        risingStockCount: industry.risingStockCount,
        fallingStockCount: industry.fallingStockCount,
        stocks: industry.topStocks.map((stock) => ({
          id: stock.stockId,
          market: stock.market,
          code: stock.ticker,
          name: stock.name,
          price: stock.price,
          currency: stock.currency,
          changeRate: stock.changeRate,
        })),
      })),
    }),
  })

export const pinnedIndustriesQueryOptions = () =>
  queryOptions({
    queryKey: ["pinned-industries"],
    queryFn: ({ signal }) => getPinnedIndustries({ signal }),
    select: ({ data: response }) => response.industryIds,
  })
