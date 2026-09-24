import type { ComponentProps } from "react"
import { RelatedArticleCard } from "../articles/RelatedArticleCard"
import { Button } from "../ui/Button"
import { ChangeRate } from "../common/ChangeRate"
import { DemoNotice } from "../common/DemoNotice"

export type NewsGroup = {
  id: string
  industry: string
  trend: "up" | "down"
  change: number
  summary: string
  selectionReason: string
  articles: ComponentProps<typeof RelatedArticleCard>[]
  stocks: { ticker: string; name: string }[]
}
export function KeyNewsList({
  groups,
  onStockSelect,
}: {
  groups: NewsGroup[]
  onStockSelect?: (ticker: string) => void
}) {
  return (
    <section aria-label="핵심 뉴스 · 예시" className="space-y-4">
      <h2 className="text-xl font-bold">핵심 뉴스</h2>
      <DemoNotice message="아래 뉴스·공시와 산업 요약은 정적 예시입니다. 관련 보도가 가격 변화의 원인임을 의미하지 않습니다." />
      {!groups.length && (
        <p className="rounded-xl border p-6 text-muted-foreground">표시할 예시 뉴스가 없습니다.</p>
      )}
      {groups.map((group) => (
        <section
          key={group.id}
          aria-label={`${group.industry} 요약`}
          className="space-y-3 rounded-xl border bg-muted/40 p-4"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">
              {group.industry} · {group.trend === "up" ? "상승" : "하락"} 산업 요약
            </h2>
            <ChangeRate value={group.change} />
          </div>
          <p className="text-sm/relaxed">{group.summary}</p>
          <p className="text-sm/relaxed text-muted-foreground">
            <strong>선정 근거: </strong>
            {group.selectionReason}
          </p>
          <div className="grid gap-3 lg:grid-cols-2">
            {group.articles.map((article) => (
              <RelatedArticleCard key={`${article.kind}-${article.title}`} {...article} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">관련 예시 종목:</span>
            {group.stocks.map((stock) =>
              onStockSelect ? (
                <Button key={stock.ticker} onClick={() => onStockSelect(stock.ticker)}>
                  {stock.name} ({stock.ticker}) 선택
                </Button>
              ) : (
                <span key={stock.ticker} className="rounded-sm bg-secondary px-2 py-1 text-sm">
                  {stock.name} ({stock.ticker})
                </span>
              ),
            )}
          </div>
        </section>
      ))}
    </section>
  )
}
