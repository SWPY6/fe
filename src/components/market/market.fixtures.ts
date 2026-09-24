import type { DataTimestampProps } from "../common/DataTimestamp"
import type { MarketIndicator } from "./MarketIndexCard"
import type { Industry } from "./IndustryCarousel"

export const exampleTimestamp: DataTimestampProps = {
  dateTime: "2026-09-04T15:30:00+09:00",
  label: "2026.09.04 15:30",
  timeZone: "Asia/Seoul · KST",
  source: "PLOUTOS 디자인용 정적 fixture",
  priceBasis: "직전 거래일 종가 대비 · 실시간 아님",
}
export const domesticIndicators: MarketIndicator[] = [
  { id: "kospi", name: "KOSPI", value: 2684.32, unit: "pt", change: 1.24 },
  { id: "kosdaq", name: "KOSDAQ", value: 782.18, unit: "pt", change: -0.82 },
  { id: "usd-krw", name: "USD/KRW", value: 1338.5, unit: "KRW / USD", change: 0 },
  { id: "wti", name: "WTI", value: 72.31, unit: "USD / 배럴", change: -1.35 },
]
export const overseasIndicators: MarketIndicator[] = [
  { id: "sp500", name: "S&P 500", value: 5626.02, unit: "pt", change: 0.74 },
  { id: "nasdaq", name: "NASDAQ", value: 17713.62, unit: "pt", change: -0.35 },
]
export const industryFixtures: Industry[] = [
  "반도체",
  "자동차",
  "금융",
  "헬스케어",
  "에너지",
  "소프트웨어",
  "산업재",
  "소비재",
  "통신",
].map((name, index) => ({
  id: `industry-${index}`,
  name,
  change: [2.43, 1.82, 0.74, 0, -0.35, -0.86, -1.24, -1.68, -2.15][index],
  rank: index + 1,
  constituentCount: 4,
  stocks: [1, 2, 3].map((number) => ({
    ticker: `DEMO${index}${number}`,
    name: `예시 ${name} ${number}`,
    change: (4 - index) * 0.6 + number * 0.1,
  })),
}))
