import { en, Faker } from "@faker-js/faker"

import type {
  Chart1Interval,
  IndicatorCard,
  MarketChartResponse,
  MarketChartResponseIndicator,
  MarketSummaryResponse,
} from "../generated/api.schemas"

// 두 시장 모두 장이 끝난 전날을 기준으로 한 스냅샷. 공휴일은 재현하지 않는다.
const date = new Date()
date.setUTCHours(0, 0, 0, 0)
do {
  date.setUTCDate(date.getUTCDate() - 1)
} while (date.getUTCDay() === 0 || date.getUTCDay() === 6)

export const marketDate = date.toISOString().slice(0, 10)
const newYorkOffset = new Intl.DateTimeFormat("en", {
  timeZone: "America/New_York",
  timeZoneName: "longOffset",
})
  .formatToParts(date)
  .find((part) => part.type === "timeZoneName")
  ?.value.replace("GMT", "")

export const markets = {
  KR: {
    currency: "KRW",
    timezone: "Asia/Seoul",
    priceAt: `${marketDate}T15:30:00+09:00`,
  },
  US: {
    currency: "USD",
    timezone: "America/New_York",
    priceAt: `${marketDate}T16:00:00${newYorkOffset}`,
  },
} satisfies Record<string, { currency: "KRW" | "USD"; timezone: string; priceAt: string }>

const random = new Faker({ locale: en })
random.seed(260930)

const indicators = [
  { indicator: "KOSPI", name: "코스피", unit: "POINT", previousClose: 6800, market: "KR" },
  { indicator: "KOSDAQ", name: "코스닥", unit: "POINT", previousClose: 850, market: "KR" },
  { indicator: "NASDAQ", name: "나스닥", unit: "POINT", previousClose: 26800, market: "US" },
  { indicator: "SP500", name: "S&P 500", unit: "POINT", previousClose: 7600, market: "US" },
  { indicator: "USD_KRW", name: "원/달러", unit: "KRW", previousClose: 1350, market: "KR" },
] satisfies (Pick<IndicatorCard, "indicator" | "name" | "unit"> & {
  previousClose: number
  market: keyof typeof markets
})[]

const cards = indicators.map(({ previousClose, market, ...indicator }) => {
  const value = Number((previousClose * random.number.float({ min: 0.98, max: 1.02 })).toFixed(2))
  const change = Number((value - previousClose).toFixed(2))
  return {
    indicator: indicator.indicator,
    name: indicator.name,
    unit: indicator.unit,
    value,
    change,
    changeRate: Number(((change / previousClose) * 100).toFixed(2)),
    valueAt: markets[market].priceAt,
  } satisfies IndicatorCard
})

export const marketSummary = {
  DOMESTIC: { region: "DOMESTIC", indicators: [cards[0], cards[1], cards[4]] },
  OVERSEAS: { region: "OVERSEAS", indicators: [cards[2], cards[3], cards[4]] },
} satisfies Record<string, MarketSummaryResponse>

function periodKey(tradeAt: string, interval: Chart1Interval) {
  if (interval === "1D") return tradeAt
  if (interval === "1W") {
    const monday = new Date(`${tradeAt}T00:00:00Z`)
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7))
    return monday.toISOString().slice(0, 10)
  }
  if (interval === "1M") return tradeAt.slice(0, 7)
  if (interval === "3M") {
    const quarter = Math.floor((Number(tradeAt.slice(5, 7)) - 1) / 3) + 1
    return `${tradeAt.slice(0, 4)}-Q${quarter}`
  }
  return tradeAt.slice(0, 4)
}

export function marketChart(
  indicator: MarketChartResponseIndicator,
  from: string,
  to: string,
  interval: Chart1Interval,
): MarketChartResponse {
  const card = cards.find((item) => item.indicator === indicator)
  if (!card) throw new Error(`Unknown market indicator: ${indicator}`)

  const days: string[] = []
  const day = new Date(`${marketDate}T00:00:00Z`)
  while (days.length < 5) {
    if (day.getUTCDay() !== 0 && day.getUTCDay() !== 6) {
      days.unshift(day.toISOString().slice(0, 10))
    }
    day.setUTCDate(day.getUTCDate() - 1)
  }

  const grouped = new Map<string, MarketChartResponse["candles"][number]>()
  days.forEach((tradeAt, index) => {
    if (tradeAt < from || tradeAt > to) return
    const close = Number((card.value * (0.98 + index * 0.005)).toFixed(2))
    const candle = { tradeAt, open: close, high: close, low: close, close, closed: true }
    const key = periodKey(tradeAt, interval)
    const previous = grouped.get(key)
    grouped.set(
      key,
      previous
        ? {
            ...previous,
            high: Math.max(previous.high, candle.high),
            low: Math.min(previous.low, candle.low),
            close: candle.close,
            closed: previous.closed && candle.closed,
          }
        : candle,
    )
  })
  const candles = Array.from(grouped.values())

  return {
    indicator,
    name: card.name,
    unit: card.unit,
    interval,
    from: candles[0]?.tradeAt ?? null,
    to: candles.at(-1)?.tradeAt ?? null,
    asOf: null,
    candles,
  }
}
