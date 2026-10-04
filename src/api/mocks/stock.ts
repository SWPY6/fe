import { en, faker, Faker, fakerKO } from "@faker-js/faker"

import { getStockListItemMock } from "../generated/api.msw"
import type { CandleMock } from "../generated/api.msw"
import { IndustryTrendResponseCode, ReadStocksCountry } from "../generated/api.schemas"
import type {
  ChartInterval,
  ReadStocksParams,
  StockChartResponse,
  StockListItem,
} from "../generated/api.schemas"
import { industryNames } from "./industry"
import { marketDate, markets } from "./market"

// 같은 종목의 짧은 구간과 긴 구간을 조회해도 겹치는 일봉은 같다.
function stockHistory(stock: StockListItem, from: string) {
  const random = new Faker({ locale: en })
  random.seed(stock.stockId)
  const precision = stock.currency === "KRW" ? 0 : 2
  const candles: CandleMock[] = []
  const day = new Date(`${marketDate}T00:00:00Z`)
  const earliest = new Date(day)
  earliest.setUTCFullYear(day.getUTCFullYear() - 5, day.getUTCMonth() + 1, 0)
  earliest.setUTCDate(Math.min(day.getUTCDate(), earliest.getUTCDate()))
  let close = stock.price

  while (day.getTime() >= earliest.getTime() && day.toISOString().slice(0, 10) >= from) {
    if (day.getUTCDay() !== 0 && day.getUTCDay() !== 6) {
      const previousClose = Math.max(
        1,
        Number((close / random.number.float({ min: 0.97, max: 1.03 })).toFixed(precision)),
      )
      const open = Math.max(
        1,
        Number(
          (previousClose * random.number.float({ min: 0.995, max: 1.005 })).toFixed(precision),
        ),
      )
      const high = Number(
        (Math.max(open, close) * random.number.float({ min: 1, max: 1.015 })).toFixed(precision),
      )
      const low = Math.max(
        1,
        Number(
          (Math.min(open, close) * random.number.float({ min: 0.985, max: 1 })).toFixed(precision),
        ),
      )
      const volume = Math.round(
        (stock.indicators.volume ?? 0) * random.number.float({ min: 0.5, max: 1.5 }),
      )
      candles.push({
        tradeAt: day.toISOString().slice(0, 10),
        open,
        high,
        low,
        close,
        volume: candles.length === 0 ? (stock.indicators.volume ?? 0) : volume,
        closed: true,
      })
      close = previousClose
    }
    day.setUTCDate(day.getUTCDate() - 1)
  }
  return candles.toReversed()
}

faker.seed(260930)
faker.setDefaultRefDate(`${marketDate}T00:00:00Z`)
fakerKO.seed(260930)

const stocksPerIndustry = 8
const usTickers = faker.helpers.uniqueArray(
  () => faker.string.alpha({ length: 4, casing: "upper" }),
  Object.keys(IndustryTrendResponseCode).length * stocksPerIndustry,
)

const recentFrom = new Date(`${marketDate}T00:00:00Z`)
recentFrom.setUTCDate(recentFrom.getUTCDate() - 40)

export const stocks = Object.values(ReadStocksCountry).flatMap((country, countryIndex) =>
  Object.values(IndustryTrendResponseCode).flatMap((industryCode, industryIndex) =>
    Array.from({ length: stocksPerIndustry }, (_, index) => {
      const stockId = countryIndex * 1000 + industryIndex * stocksPerIndustry + index + 1
      const generated = getStockListItemMock()
      const market = markets[country]
      const item = {
        ...generated,
        stockId,
        name:
          country === "KR"
            ? `${fakerKO.person.firstName()}${industryNames[industryCode]}`
            : generated.name,
        ticker:
          country === "KR"
            ? String(stockId).padStart(6, "0")
            : usTickers[industryIndex * stocksPerIndustry + index],
        currency: market.currency,
        price: country === "KR" ? Math.round(generated.price) * 100 : generated.price,
        priceTiming: "DELAYED",
        priceAt: market.priceAt,
        industryCode,
        industryName: industryNames[industryCode],
        caution: index === 0,
        contextSummary: null,
      } satisfies StockListItem
      const recent = stockHistory(item, recentFrom.toISOString().slice(0, 10))
      const latest = recent[recent.length - 1]
      const previousClose = recent[recent.length - 2].close
      const previous20 = recent.slice(-21, -1)
      const averageVolume =
        previous20.reduce((sum, candle) => sum + candle.volume, 0) / previous20.length
      const change = Number((latest.close - previousClose).toFixed(2))
      return {
        country,
        averageTradingValue20d:
          previous20.reduce(
            (sum, candle) =>
              sum + ((candle.open + candle.high + candle.low + candle.close) / 4) * candle.volume,
            0,
          ) / previous20.length,
        item: {
          ...item,
          change,
          changeRate: Number(((change / previousClose) * 100).toFixed(2)),
          indicators: {
            previousClose,
            open: latest.open,
            high: latest.high,
            low: latest.low,
            volume: latest.volume,
            volumeRatio20d: Number((latest.volume / averageVolume).toFixed(2)),
            marketCap: item.price * faker.number.int({ min: 10_000_000, max: 500_000_000 }),
            tradingValue: Math.round(
              ((latest.open + latest.high + latest.low + latest.close) / 4) * latest.volume,
            ),
          },
        },
      }
    }),
  ),
)

export type Stock = (typeof stocks)[number]

export function stockList({
  country,
  q = "",
  industry,
  sort = "UP",
  page = 1,
  size = 20,
  includeCaution = false,
}: ReadStocksParams) {
  const query = q.trim().toLocaleLowerCase()
  const items = stocks
    .filter((stock) => stock.country === country)
    .map((stock) => stock.item)
    .filter(
      (stock) =>
        (includeCaution || !stock.caution) &&
        (!industry || stock.industryCode === industry) &&
        (!query || `${stock.name} ${stock.ticker}`.toLocaleLowerCase().includes(query)),
    )
    .filter((stock) =>
      sort === "UP" ? stock.changeRate > 0 : sort === "DOWN" ? stock.changeRate < 0 : true,
    )
    .toSorted((a, b) =>
      sort === "VOLUME"
        ? b.indicators.volumeRatio20d - a.indicators.volumeRatio20d
        : sort === "DOWN"
          ? a.changeRate - b.changeRate
          : b.changeRate - a.changeRate,
    )
  return { items: items.slice((page - 1) * size, page * size), total: items.length, page, size }
}

export function stockChart(stock: Stock, from: string, to: string, interval: ChartInterval) {
  const candles: CandleMock[] = []
  let previousPeriod = ""
  for (const daily of stockHistory(stock.item, from).filter((candle) => candle.tradeAt <= to)) {
    const day = new Date(`${daily.tradeAt}T00:00:00Z`)
    const periodEnd = new Date(day)
    let period = daily.tradeAt
    if (interval === "1W") {
      day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7))
      period = day.toISOString().slice(0, 10)
      periodEnd.setTime(day.getTime())
      periodEnd.setUTCDate(day.getUTCDate() + 4)
    } else if (interval !== "1D") {
      const months = interval === "1M" ? 1 : interval === "3M" ? 3 : 12
      const month = Math.floor(day.getUTCMonth() / months) * months
      period = `${day.getUTCFullYear()}-${month}`
      periodEnd.setUTCFullYear(day.getUTCFullYear(), month + months, 0)
      while (periodEnd.getUTCDay() === 0 || periodEnd.getUTCDay() === 6)
        periodEnd.setUTCDate(periodEnd.getUTCDate() - 1)
    }
    const closed = to < marketDate || periodEnd.toISOString().slice(0, 10) <= marketDate
    const candle = candles[candles.length - 1]
    if (period === previousPeriod) {
      candle.high = Math.max(candle.high, daily.high)
      candle.low = Math.min(candle.low, daily.low)
      candle.close = daily.close
      candle.volume += daily.volume
    } else {
      candles.push({ ...daily, closed })
      previousPeriod = period
    }
  }
  const confirmed = candles.filter((candle) => candle.closed).slice(-20)
  return {
    stockId: stock.item.stockId,
    interval,
    currency: stock.item.currency,
    from: candles[0]?.tradeAt ?? null,
    to: candles.at(-1)?.tradeAt ?? null,
    asOf: candles.some((candle) => !candle.closed) ? stock.item.priceAt : null,
    averageVolume: confirmed.length
      ? Math.round(confirmed.reduce((sum, candle) => sum + candle.volume, 0) / confirmed.length)
      : null,
    candles,
  } satisfies StockChartResponse
}
