type ChangeRateProps = {
  value: number | null | undefined
}

export function ChangeRate({ value }: ChangeRateProps) {
  if (value == null || !Number.isFinite(value)) {
    return <span className="text-muted-foreground">정보 없음</span>
  }

  const roundedValue = Number(value.toFixed(2))

  let colorClass = "text-muted-foreground"
  let sign = ""

  if (roundedValue > 0) {
    colorClass = "text-change-up"
    sign = "+"
  } else if (roundedValue < 0) {
    colorClass = "text-change-down"
  }

  return (
    <span className={`tabular-nums ${colorClass}`}>
      {sign}
      {roundedValue.toFixed(2)}%
    </span>
  )
}
