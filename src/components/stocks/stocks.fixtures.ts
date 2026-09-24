import type { Mover } from "./MoversTable"

export const domesticMovers: Mover[] = Array.from({ length: 100 }, (_, index) => ({
  ticker: `DEMO${String(index + 1).padStart(3, "0")}`,
  name: `예시 국내기업 ${index + 1}`,
  price: 12000 + index * 1250,
  change: Math.round((5 - (index % 21) * 0.5) * 100) / 100,
  volume: 100000 + index * 13500,
  relativeVolume: 0.5 + (index % 12) * 0.25,
  marketCap: 100000000000 + index * 5000000000,
  turnover: (12000 + index * 1250) * (100000 + index * 13500),
  reason: ["실적 관련 예시 보도", "산업 동향 예시", "예시 공시 확인"][index % 3],
}))
export const overseasMovers: Mover[] = domesticMovers.map((row, index) => ({
  change: row.change,
  volume: row.volume,
  relativeVolume: row.relativeVolume,
  reason: row.reason,
  ticker: `EX${String(index + 1).padStart(3, "0")}`,
  name: `Example Company ${index + 1}`,
  price: 24.5 + index * 1.75,
  marketCap: 800000000 + index * 25000000,
  turnover: (24.5 + index * 1.75) * row.volume,
}))
