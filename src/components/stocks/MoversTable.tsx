/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The scrollable table region needs keyboard focus for horizontal scrolling. */
import { useState } from "react"
import { orderBy } from "es-toolkit"
import { ChangeRate } from "../common/ChangeRate"
import { DataTimestamp, type DataTimestampProps } from "../common/DataTimestamp"
import { Button } from "../ui/Button"

export type Mover = {
  ticker: string
  name: string
  price: number
  change: number
  volume: number
  relativeVolume: number
  marketCap: number
  turnover: number
  reason: string
}
type SortKey = "price" | "change" | "volume" | "relativeVolume" | "marketCap" | "turnover"
export type MoverSort = { key: SortKey; direction: "asc" | "desc" }
const columns: { key: SortKey; label: string }[] = [
  { key: "price", label: "현재가" },
  { key: "change", label: "등락률" },
  { key: "volume", label: "거래량 (주)" },
  { key: "relativeVolume", label: "평소 대비 (배)" },
  { key: "marketCap", label: "시가총액" },
  { key: "turnover", label: "거래대금" },
]
type MoversTableProps = {
  rows: Mover[]
  marketLabel: string
  currency: "KRW" | "USD"
  timestamp: DataTimestampProps
  initialSort?: MoverSort
  initialPage?: number
  onStockSelect?: (ticker: string) => void
}

export function MoversTable({
  rows,
  marketLabel,
  currency,
  timestamp,
  initialSort,
  initialPage = 1,
  onStockSelect,
}: MoversTableProps) {
  const [sort, setSort] = useState(initialSort)
  const [requestedPage, setPage] = useState(initialPage)
  const pageSize = 20
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const page = Math.max(1, Math.min(requestedPage, pageCount))
  const sorted = sort ? orderBy(rows, [sort.key], [sort.direction]) : rows
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize)
  const formatPrice = (value: number) =>
    value.toLocaleString("ko-KR", {
      minimumFractionDigits: currency === "USD" ? 2 : 0,
      maximumFractionDigits: currency === "USD" ? 2 : 0,
    })
  return (
    <section className="space-y-4" aria-label={`${marketLabel} 주요 변동 종목`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">주요 변동 종목 · {marketLabel}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            정적 예시 {rows.length}개 · 통화 {currency} · 페이지당 20개
          </p>
        </div>
        <DataTimestamp {...timestamp} />
      </div>
      <p className="text-xs text-muted-foreground">
        가격·시가총액·거래대금 단위: {currency}. 평소 대비는 예시 20거래일 평균 거래량 대비입니다.
        변동 이유는 가상 맥락이며 실제 원인으로 단정하지 않습니다.
      </p>
      <section
        aria-label="종목 표 · 좁은 화면에서는 가로 스크롤"
        tabIndex={0}
        className="overflow-x-auto rounded-xl border bg-card focus-visible:outline-2 focus-visible:outline-ring"
      >
        <table className="w-full min-w-280 text-sm">
          <caption className="p-3 text-left text-xs text-muted-foreground">
            디자인용 예시 종목 · 열 제목 버튼으로 정렬 · 좌우로 스크롤해 모든 열 확인
          </caption>
          <thead className="border-b bg-muted">
            <tr>
              <th scope="col" className="p-3 text-left">
                순위
              </th>
              <th scope="col" className="p-3 text-left">
                종목 / 티커
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="p-3 text-right"
                  aria-sort={
                    sort?.key === column.key
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    className="min-h-10 rounded-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-ring"
                    onClick={() => {
                      setSort({
                        key: column.key,
                        direction:
                          sort?.key === column.key && sort.direction === "desc" ? "asc" : "desc",
                      })
                      setPage(1)
                    }}
                    aria-label={`${column.label} ${sort?.key === column.key && sort.direction === "desc" ? "오름차순" : "내림차순"} 정렬`}
                  >
                    {column.label}{" "}
                    <span aria-hidden="true">
                      {sort?.key === column.key ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}
                    </span>
                  </button>
                </th>
              ))}
              <th scope="col" className="p-3 text-left">
                변동 이유 · 예시
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => (
              <tr key={row.ticker} className="border-b last:border-0">
                <td className="px-3 py-4 tabular-nums">{(page - 1) * pageSize + index + 1}</td>
                <th scope="row" className="min-w-44 px-3 py-4 text-left font-medium">
                  <div className="max-w-64 wrap-break-word">
                    {onStockSelect ? (
                      <Button onClick={() => onStockSelect(row.ticker)}>{row.name}</Button>
                    ) : (
                      row.name
                    )}
                  </div>
                  <p className="mt-1 text-xs font-normal text-muted-foreground">{row.ticker}</p>
                </th>
                <td className="px-3 py-4 text-right tabular-nums">{formatPrice(row.price)}</td>
                <td className="px-3 py-4 text-right">
                  <ChangeRate value={row.change} />
                </td>
                <td className="px-3 py-4 text-right tabular-nums">
                  {row.volume.toLocaleString("ko-KR")}
                </td>
                <td className="px-3 py-4 text-right tabular-nums">
                  {row.relativeVolume.toFixed(2)}
                </td>
                <td className="px-3 py-4 text-right tabular-nums">{formatPrice(row.marketCap)}</td>
                <td className="px-3 py-4 text-right tabular-nums">{formatPrice(row.turnover)}</td>
                <td className="min-w-48 px-3 py-4 text-muted-foreground">{row.reason}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted-foreground">
                  표시할 예시 종목이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <output className="text-sm">
          {page} / {pageCount} 페이지 · {rows.length ? (page - 1) * pageSize + 1 : 0}–
          {Math.min(page * pageSize, rows.length)} / {rows.length}개
          {sort &&
            ` · ${columns.find((column) => column.key === sort.key)?.label} ${sort.direction === "asc" ? "오름차순" : "내림차순"}`}
        </output>
        <fieldset className="flex gap-2" aria-label="종목 표 페이지 이동">
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
            이전 페이지
          </Button>
          <Button disabled={page === pageCount} onClick={() => setPage(page + 1)}>
            다음 페이지
          </Button>
        </fieldset>
      </div>
    </section>
  )
}
