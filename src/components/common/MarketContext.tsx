export function MarketContext({
  label,
  currency,
  sampleCount,
}: {
  label: string
  currency: "KRW" | "USD"
  sampleCount: number
}) {
  return (
    <p className="text-sm text-muted-foreground">
      {label} · {currency} · {sampleCount.toLocaleString("ko-KR")}개 예시 종목
    </p>
  )
}
