import { ChangeRate } from "../common/ChangeRate"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/Button"

export type MarketIndicator = {
  id: string
  name: string
  value: number
  unit: string
  change: number | null
}
export function MarketIndexCard({
  indicator,
  onSelect,
}: {
  indicator: MarketIndicator
  onSelect?: (id: string) => void
}) {
  return (
    <Card className="min-w-0">
      <CardContent className="space-y-3">
        <h3 className="font-medium">{indicator.name}</h3>
        <p className="text-2xl font-bold wrap-anywhere tabular-nums">
          {indicator.value.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}{" "}
          <span className="text-sm font-normal text-muted-foreground">{indicator.unit}</span>
        </p>
        <ChangeRate value={indicator.change} />
        <p className="text-xs text-muted-foreground">예시 · 직전 거래일 종가 대비</p>
        {onSelect && <Button onClick={() => onSelect(indicator.id)}>{indicator.name} 선택</Button>}
      </CardContent>
    </Card>
  )
}
