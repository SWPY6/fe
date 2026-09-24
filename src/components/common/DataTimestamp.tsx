export type DataTimestampProps = {
  dateTime: string
  label: string
  timeZone: string
  source: string
  priceBasis: string
}
export function DataTimestamp({
  dateTime,
  label,
  timeZone,
  source,
  priceBasis,
}: DataTimestampProps) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <p>
        예시 데이터 기준: <time dateTime={dateTime}>{label}</time> ({timeZone})
      </p>
      <p>
        {priceBasis} · 출처: {source}
      </p>
    </div>
  )
}
