import { queryOptions } from "@tanstack/react-query"

import { getIndicatorHistory, getMarketSummary } from "@/api/generated/api"
import type { Market, Period } from "@/api/generated/api.schemas"

export const marketSummaryQueryOptions = (market: Market) =>
  queryOptions({
    queryKey: ["market-summary", market],
    queryFn: ({ signal }) => getMarketSummary(market, { signal }),
    select: ({ data: response }) => ({
      market: response.market,
      timezone: response.timezone,
      currency: response.currency,
      asOf: response.asOf,
      indicators: response.indicators.map((indicator) => ({
        id: indicator.indicatorId,
        name: indicator.name,
        value: indicator.value,
        unit: indicator.unit,
        change: indicator.change,
        changeRate: indicator.changeRate,
        previousClose: indicator.previousClose,
        asOf: indicator.asOf,
      })),
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
        topStocks: industry.topStocks.map((stock) => ({
          id: stock.stockId,
          market: stock.market,
          code: stock.ticker,
          name: stock.name,
          price: stock.price,
          currency: stock.currency,
          changeRate: stock.changeRate,
        })),
      })),
      highlights: response.highlights.map((highlight) => ({
        direction: highlight.direction,
        industryId: highlight.industryId,
        industryName: highlight.name,
        averageChangeRate: highlight.averageChangeRate,
        rank: highlight.rank,
        risingStockCount: highlight.risingStockCount,
        fallingStockCount: highlight.fallingStockCount,
        tradingValueChangeRate: highlight.tradingValueChangeRate,
        selectionBasis: highlight.selectionBasis,
        materials: highlight.materials.map((material) => ({
          id: material.materialId,
          type: material.type,
          title: material.title,
          source: material.source,
          publishedAt: material.publishedAt,
          summary: material.summary,
          url: material.url,
        })),
      })),
      movers: response.movers.map((stock) => ({
        id: stock.stockId,
        market: stock.market,
        code: stock.ticker,
        name: stock.name,
        price: stock.price,
        currency: stock.currency,
        changeRate: stock.changeRate,
        volume: stock.volume,
        volumeRatio20d: stock.volumeRatio20d,
        marketCap: stock.marketCap,
        tradingValue: stock.tradingValue,
        asOf: stock.asOf,
      })),
    }),
  })

export const indicatorHistoryQueryOptions = (market: Market, indicatorId: string, period: Period) =>
  queryOptions({
    queryKey: ["indicator-history", market, indicatorId, period],
    queryFn: ({ signal }) => getIndicatorHistory(market, indicatorId, { period }, { signal }),
    select: ({ data: response }) => ({
      indicatorId: response.indicatorId,
      period: response.period,
      unit: response.unit,
      currency: response.currency,
      previousClose: response.previousClose,
      asOf: response.asOf,
      candles: response.candles.map((candle) => ({
        date: candle.tradeAt,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      })),
    }),
  })
