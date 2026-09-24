import { useEffect, useState } from "react"
import { ChangeRate } from "../common/ChangeRate"
import { Button } from "../ui/Button"
import { Card, CardHeader, CardContent } from "../ui/card"

export type Industry = {
  id: string
  name: string
  change: number
  rank: number
  constituentCount: number
  stocks: { ticker: string; name: string; change: number }[]
}
type IndustryCarouselProps = {
  industries: Industry[]
  initialIndex?: number
  initialAutoRotate?: boolean
  initialFixed?: boolean
  intervalMs?: number
  onSelect?: (industry: Industry) => void
}

export function IndustryCarousel({
  industries,
  initialIndex = 0,
  initialAutoRotate = false,
  initialFixed = false,
  intervalMs = 5000,
  onSelect,
}: IndustryCarouselProps) {
  const [index, setIndex] = useState(initialIndex)
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate)
  const [fixed, setFixed] = useState(initialFixed)
  const count = industries.length
  const activeIndex = count ? ((index % count) + count) % count : 0
  const industry = industries[activeIndex]
  const rotating = autoRotate && !fixed && count > 1
  useEffect(() => {
    if (!rotating) return
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % count),
      Math.max(1000, intervalMs),
    )
    return () => window.clearInterval(timer)
  }, [rotating, count, intervalMs])

  return (
    <section aria-label="산업별 동향 · 예시 데이터" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">
          산업별 동향 <span className="text-sm font-normal text-muted-foreground">예시</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={count < 2 || fixed}
            onClick={() => setIndex((current) => (current - 1 + count) % count)}
          >
            이전 산업
          </Button>
          <Button
            disabled={count < 2 || fixed}
            onClick={() => setIndex((current) => (current + 1) % count)}
          >
            다음 산업
          </Button>
          <Button
            disabled={count < 2 || fixed}
            aria-pressed={autoRotate}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            {autoRotate ? "자동 전환 일시 정지" : "자동 전환 시작"}
          </Button>
          <Button disabled={!count} aria-pressed={fixed} onClick={() => setFixed(!fixed)}>
            {fixed ? "산업 고정 해제" : "산업 고정"}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {fixed ? "선택 산업 고정 · 자동 전환 중지" : rotating ? "자동 전환 중" : "자동 전환 정지"} ·
        처음과 마지막 산업은 순환합니다.
      </p>
      <fieldset className="flex flex-wrap gap-2" aria-label="산업 선택">
        {industries.map((item, itemIndex) => (
          <Button
            key={item.id}
            disabled={fixed}
            aria-pressed={itemIndex === activeIndex}
            onClick={() => setIndex(itemIndex)}
          >
            {item.name}
          </Button>
        ))}
      </fieldset>
      <div aria-live={rotating ? "off" : "polite"} aria-atomic="true">
        {industry ? (
          <Card>
            <CardHeader>
              <p className="text-xs text-muted-foreground">
                {activeIndex + 1} / {count} · {industry.rank}위 · 구성 {industry.constituentCount}개
                예시 종목
              </p>
              <h3 className="text-lg font-bold">{industry.name}</h3>
              <p>
                평균 등락률 <ChangeRate value={industry.change} />
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {industry.stocks.length ? (
                <ul className="grid gap-2 sm:grid-cols-3">
                  {industry.stocks.map((stock) => (
                    <li key={stock.ticker} className="rounded-lg bg-muted p-3">
                      <p className="font-medium">{stock.name}</p>
                      <p className="text-xs text-muted-foreground">{stock.ticker}</p>
                      <ChangeRate value={stock.change} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p>표시할 예시 종목이 없습니다.</p>
              )}
              {onSelect && <Button onClick={() => onSelect(industry)}>{industry.name} 선택</Button>}
            </CardContent>
          </Card>
        ) : (
          <p className="rounded-xl border p-6 text-muted-foreground">표시할 산업이 없습니다.</p>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        출처: PLOUTOS 정적 fixture · 실제 산업 수익률이 아닙니다.
      </p>
    </section>
  )
}
