import { DataTimestamp, type DataTimestampProps } from "../common/DataTimestamp"
import { DemoNotice } from "../common/DemoNotice"
import { MarketIndexCard, type MarketIndicator } from "./MarketIndexCard"

export function MarketSnapshot({
  title,
  indicators,
  timestamp,
  onSelect,
}: {
  title: string
  indicators: MarketIndicator[]
  timestamp: DataTimestampProps
  onSelect?: (id: string) => void
}) {
  return (
    <section aria-label={title} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
        <DataTimestamp {...timestamp} />
      </div>
      <DemoNotice />
      {indicators.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {indicators.map((indicator) => (
            <MarketIndexCard key={indicator.id} indicator={indicator} onSelect={onSelect} />
          ))}
        </div>
      ) : (
        <p className="p-6 text-muted-foreground">표시할 예시 지표가 없습니다.</p>
      )}
    </section>
  )
}
