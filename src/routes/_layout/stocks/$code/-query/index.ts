import { queryOptions } from "@tanstack/react-query"

import {
  getStock,
  getStockChart,
  getStockContext,
  getStockMaterials,
  getStockQuote,
  listPriceAlerts,
} from "@/api/generated/api"
import type { GetStockChartPeriod } from "@/api/generated/api.schemas"

export const stockIdentityQueryOptions = (stockId: number) =>
  queryOptions({
    queryKey: ["stock", stockId, "identity"],
    queryFn: ({ signal }) => getStock(stockId, { signal }),
    select: ({ data: response }) => ({
      id: response.stockId,
      market: response.market,
      code: response.ticker,
      name: response.name,
      industryId: response.industryId,
      industryName: response.industryName,
      caution: response.caution,
    }),
  })

export const stockQuoteQueryOptions = (stockId: number) =>
  queryOptions({
    queryKey: ["stock", stockId, "quote"],
    queryFn: ({ signal }) => getStockQuote(stockId, { signal }),
    refetchInterval: 10_000,
    select: ({ data: response }) => ({
      id: response.stockId,
      code: response.ticker,
      name: response.name,
      currency: response.currency,
      price: response.price,
      change: response.change,
      changeRate: response.changeRate,
      priceAt: response.priceAt,
      priceTiming: response.priceTiming,
      indicators: {
        previousClose: response.indicators.previousClose,
        open: response.indicators.open,
        high: response.indicators.high,
        low: response.indicators.low,
        volume: response.indicators.volume,
        volumeRatio20d: response.indicators.volumeRatio20d,
        marketCap: response.indicators.marketCap,
        tradingValue: response.indicators.tradingValue,
      },
    }),
  })

export const stockChartQueryOptions = (stockId: number, period: GetStockChartPeriod) =>
  queryOptions({
    queryKey: ["stock", stockId, "chart", period],
    queryFn: ({ signal }) => getStockChart(stockId, { period }, { signal }),
    select: ({ data: response }) => ({
      id: response.stockId,
      period: response.period,
      currency: response.currency,
      from: response.from,
      to: response.to,
      asOf: response.asOf,
      averageVolume20d: response.averageVolume20d,
      candles: response.candles.map((candle) => ({
        date: candle.tradeAt,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
        closed: candle.closed,
      })),
    }),
  })

export const stockContextQueryOptions = (stockId: number) =>
  queryOptions({
    queryKey: ["stock", stockId, "context"],
    queryFn: ({ signal }) => getStockContext(stockId, { signal }),
    select: ({ data: response }) => ({
      id: response.stockId,
      summary: response.summary,
      materialIds: response.materialIds,
      asOf: response.asOf,
    }),
  })

export const stockMaterialsQueryOptions = (stockId: number) =>
  queryOptions({
    queryKey: ["stock", stockId, "materials"],
    queryFn: ({ signal }) => getStockMaterials(stockId, { signal }),
    select: ({ data: response }) => ({
      id: response.stockId,
      asOf: response.asOf,
      newsCount: response.newsCount,
      disclosureCount: response.disclosureCount,
      materials: response.items.map((material) => ({
        id: material.materialId,
        type: material.type,
        title: material.title,
        source: material.source,
        publishedAt: material.publishedAt,
        summary: material.summary,
        url: material.url,
      })),
    }),
  })

export const stockPriceAlertsQueryOptions = (stockId: number) =>
  queryOptions({
    queryKey: ["price-alerts", stockId],
    queryFn: ({ signal }) => listPriceAlerts({ stockId }, { signal }),
    select: ({ data: response }) =>
      response.map((alert) => ({
        id: alert.alertId,
        stockId: alert.stockId,
        targetPrice: alert.targetPrice,
        currency: alert.currency,
        condition: alert.condition,
        active: alert.active,
      })),
  })
