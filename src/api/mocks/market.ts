import { en, Faker } from "@faker-js/faker"

import type { IndicatorCard, MarketSummaryResponse } from "../generated/api.schemas"

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
