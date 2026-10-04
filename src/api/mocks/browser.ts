import { HttpResponse } from "msw"
import { setupWorker } from "msw/browser"

import {
  getChartMockHandler,
  getOpenAPIDefinitionMock,
  getQuoteMockHandler,
  getReadFlowsMockHandler,
  getReadNewsMockHandler,
  getReadStocksMockHandler,
  getReadTrendsMockHandler,
  getSummary1MockHandler,
  getSummaryMockHandler,
} from "../generated/api.msw"
import {
  ChartInterval,
  ReadFlowsCountry,
  ReadNewsCountry,
  ReadStocksCountry,
  ReadStocksSort,
  ReadTrendsCountry,
  ReadTrendsFilter,
  Summary1Region,
} from "../generated/api.schemas"
import { industrySnapshot } from "./industry"
import { markets, marketSummary } from "./market"
import { stockChart, stockList, stocks } from "./stock"

function invalidInput(): never {
  // MSW는 resolver에서 던진 HttpResponse도 응답으로 처리한다.
  throw HttpResponse.json(
    {
      error: { name: "InvalidInputValueException", code: "P001", message: "잘못된 입력값입니다." },
    },
    { status: 400 },
  )
}

function enumParameter<T extends string>(
  params: URLSearchParams,
  name: string,
  values: Record<string, T>,
  fallback?: T,
) {
  const value = params.get(name) ?? fallback
  return Object.values(values).find((candidate) => candidate === value) ?? invalidInput()
}

function positiveInteger(value: string | null, fallback?: number, max = Number.MAX_SAFE_INTEGER) {
  if (value === null && fallback !== undefined) return fallback
  if (value === null || !/^\d+$/.test(value)) return invalidInput()
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > max) return invalidInput()
  return parsed
}

function requestedStock(value: string | readonly string[] | undefined) {
  if (typeof value !== "string") return invalidInput()
  const id = positiveInteger(value)
  const stock = stocks.find(({ item }) => item.stockId === id)
  if (!stock) {
    throw HttpResponse.json(
      {
        error: {
          name: "StockNotFoundException",
          code: "P002",
          message: "주식을 찾을 수 없습니다.",
        },
      },
      { status: 404 },
    )
  }
  return stock
}

const industries = {
  KR: industrySnapshot(stocks, "KR"),
  US: industrySnapshot(stocks, "US"),
}

export const worker = setupWorker(
  getReadStocksMockHandler(({ request }) => {
    const { searchParams } = new URL(request.url)
    const includeCaution = searchParams.get("includeCaution") ?? "false"
    if (includeCaution !== "true" && includeCaution !== "false") return invalidInput()
    return {
      data: stockList({
        country: enumParameter(searchParams, "country", ReadStocksCountry),
        q: searchParams.get("q") ?? undefined,
        industry: searchParams.get("industry") ?? undefined,
        sort: enumParameter(searchParams, "sort", ReadStocksSort, "UP"),
        page: positiveInteger(searchParams.get("page"), 1),
        size: positiveInteger(searchParams.get("size"), 20, 100),
        includeCaution: includeCaution === "true",
      }),
    }
  }),
  getSummaryMockHandler(({ params }) => {
    const { item, country } = requestedStock(params.stockId)
    return {
      data: {
        stockId: item.stockId,
        profile: { name: item.name, ticker: item.ticker, logoUrl: null },
        market: country,
        currency: item.currency,
        timezone: markets[country].timezone,
      },
    }
  }),
  getQuoteMockHandler(({ params }) => {
    const { item } = requestedStock(params.stockId)
    const {
      stockId,
      ticker,
      name,
      currency,
      price,
      change,
      changeRate,
      priceAt,
      priceTiming,
      indicators,
    } = item
    return {
      data: {
        stockId,
        ticker,
        name,
        currency,
        price,
        change,
        changeRate,
        priceAt,
        priceTiming,
        indicators,
      },
    }
  }),
  getChartMockHandler(({ params, request }) => {
    const stock = requestedStock(params.stockId)
    const { searchParams } = new URL(request.url)
    const interval = enumParameter(searchParams, "interval", ChartInterval, "1D")
    const to = searchParams.get("to") ?? new Date().toISOString().slice(0, 10)
    const end = new Date(`${to}T00:00:00Z`)
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(to) ||
      !Number.isFinite(end.getTime()) ||
      end.toISOString().slice(0, 10) !== to
    )
      return invalidInput()
    const defaultStart = new Date(end)
    defaultStart.setUTCDate(1)
    defaultStart.setUTCMonth(defaultStart.getUTCMonth() - 1, 0)
    defaultStart.setUTCDate(Math.min(end.getUTCDate(), defaultStart.getUTCDate()))
    const from = searchParams.get("from") ?? defaultStart.toISOString().slice(0, 10)
    const start = new Date(`${from}T00:00:00Z`)
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(from) ||
      !Number.isFinite(start.getTime()) ||
      start.toISOString().slice(0, 10) !== from ||
      from > to
    )
      return invalidInput()
    const maximumEnd = new Date(start)
    maximumEnd.setUTCFullYear(start.getUTCFullYear() + 5, start.getUTCMonth() + 1, 0)
    maximumEnd.setUTCDate(Math.min(start.getUTCDate(), maximumEnd.getUTCDate()))
    if (end > maximumEnd) return invalidInput()
    return { data: stockChart(stock, from, to, interval) }
  }),
  getSummary1MockHandler(({ request }) => {
    const region = enumParameter(new URL(request.url).searchParams, "region", Summary1Region)
    return { data: marketSummary[region] }
  }),
  getReadTrendsMockHandler(({ request }) => {
    const { searchParams } = new URL(request.url)
    const country = enumParameter(searchParams, "country", ReadTrendsCountry, "KR")
    const filter = enumParameter(searchParams, "filter", ReadTrendsFilter, "ALL")
    return { data: industries[country].trends(filter) }
  }),
  getReadFlowsMockHandler(({ request }) => {
    const country = enumParameter(
      new URL(request.url).searchParams,
      "country",
      ReadFlowsCountry,
      "KR",
    )
    return { data: industries[country].flows }
  }),
  getReadNewsMockHandler(({ request }) => {
    const country = enumParameter(
      new URL(request.url).searchParams,
      "country",
      ReadNewsCountry,
      "KR",
    )
    return { data: industries[country].news }
  }),
  ...getOpenAPIDefinitionMock(),
)
