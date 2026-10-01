import { queryOptions } from "@tanstack/react-query"

import { getMarketIndustries, listStocks } from "@/api/generated/api"
import type { ListStocksParams, Market } from "@/api/generated/api.schemas"

export const stockListQueryOptions = (params: ListStocksParams) =>
  queryOptions({
    queryKey: ["stocks", params],
    queryFn: ({ signal }) => listStocks(params, { signal }),
    select: ({ data: response }) => ({
      asOf: response.asOf,
      page: response.page,
      size: response.size,
      total: response.total,
      stocks: response.items.map((stock) => ({
        rank: stock.rank,
        id: stock.stockId,
        market: stock.market,
        code: stock.ticker,
        name: stock.name,
        industryId: stock.industryId,
        industryName: stock.industryName,
        currency: stock.currency,
        price: stock.price,
        changeRate: stock.changeRate,
        volume: stock.volume,
        volumeRatio20d: stock.volumeRatio20d,
        marketCap: stock.marketCap,
        tradingValue: stock.tradingValue,
        caution: stock.caution,
        contextSummary: stock.contextSummary,
        contextMaterialIds: stock.contextMaterialIds,
        asOf: stock.asOf,
      })),
    }),
  })

export const industryFilterQueryOptions = (market: Market) =>
  queryOptions({
    queryKey: ["industries", market],
    queryFn: ({ signal }) => getMarketIndustries(market, { signal }),
    select: ({ data: response }) =>
      response.industries.map((industry) => ({
        id: industry.industryId,
        name: industry.name,
      })),
  })
