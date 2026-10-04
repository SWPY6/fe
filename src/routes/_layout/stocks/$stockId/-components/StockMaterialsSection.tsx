// oxlint-disable react/no-array-index-key
import { useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { ExternalLink } from "lucide-react"
import { Separated } from "react-simplikit"

import { getDisclosuresQueryOptions, getNewsQueryOptions } from "@/api/generated/api"
import { ApiError } from "@/api/http/error"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs } from "@/components/ui/tabs"

const route = getRouteApi("/_layout/stocks/$stockId/")

function materialTime(value: string, country: "KR" | "US") {
  return new Date(value).toLocaleString("ko-KR", {
    timeZone: country === "KR" ? "Asia/Seoul" : "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function StockMaterialsSection() {
  const stockId = route.useParams({ select: (params) => Number(params.stockId) })
  // loader가 시작한 요청을 마운트 직후 다시 보내지 않는다. 실패 시에는 직접 재시도한다.
  const news = useQuery(
    getNewsQueryOptions(stockId, undefined, {
      query: { throwOnError: false, refetchOnMount: false, retryOnMount: false },
    }),
  )
  const disclosures = useQuery(
    getDisclosuresQueryOptions(stockId, undefined, {
      query: { throwOnError: false, refetchOnMount: false, retryOnMount: false },
    }),
  )

  return (
    <section aria-labelledby="stock-materials-title" className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="stock-materials-title" className="typo-section-heading">
          관련 뉴스·공시
        </h2>
        <p className="typo-body-sm text-muted-foreground">
          관련 자료는 가격 변동의 원인을 의미하지 않습니다.
        </p>
      </div>
      <Tabs.Root defaultValue="news" className="gap-6">
        <Tabs.List variant="underline" aria-label="관련 자료 종류">
          <Tabs.Trigger value="news">
            뉴스 {news.data ? `${news.data.data.total}건` : ""}
          </Tabs.Trigger>
          <Tabs.Trigger value="disclosures">
            공시{" "}
            {disclosures.data && disclosures.data.data.coverage !== "UNMAPPED"
              ? `${disclosures.data.data.total}건`
              : ""}
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="news" className="min-w-0">
          {news.isPending && <p className="typo-body-sm text-muted-foreground">로딩중</p>}
          {news.isError && (
            <div role="alert" className="flex flex-col items-start gap-3 py-4">
              <p className="typo-body-sm">
                {news.error instanceof ApiError ? news.error.message : "뉴스를 불러올 수 없습니다."}
              </p>
              {news.error instanceof ApiError && news.error.status === 503 ? (
                <p className="typo-body-sm text-muted-foreground">잠시 후 다시 확인해 주세요.</p>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={news.isFetching}
                  onClick={() => news.refetch()}
                >
                  뉴스 다시 불러오기
                </Button>
              )}
            </div>
          )}
          {news.data && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1 typo-caption text-muted-foreground">
                <p>
                  최근 7일 · 최신순 최대 20건 · 네이버 제공 시각
                  {news.data.data.country === "KR" ? "(한국 시각)" : "(미국 동부 시각)"}
                </p>
                <p>수집 시각 {materialTime(news.data.data.fetchedAt, news.data.data.country)}</p>
                {!news.data.data.windowCovered && (
                  <p>조회 기간의 일부 뉴스가 누락됐을 수 있습니다.</p>
                )}
              </div>
              {news.data.data.items.length === 0 ? (
                <p className="py-8 typo-body-sm text-muted-foreground">
                  조회된 관련 뉴스가 없습니다.
                </p>
              ) : (
                <ul className="flex flex-col gap-5">
                  <Separated
                    by={
                      <li aria-hidden="true">
                        <Separator />
                      </li>
                    }
                  >
                    {news.data.data.items.map((article, index) => (
                      <li
                        key={`${article.documentId}-${index}`}
                        className="flex min-w-0 flex-col gap-2"
                      >
                        <h3 className="typo-heading-xs wrap-break-word">
                          {article.url ? (
                            <a
                              className="hover:text-primary hover:underline"
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {article.title}
                              <ExternalLink
                                aria-hidden="true"
                                className="ml-1 inline size-3.5 align-baseline"
                              />
                              <span className="sr-only"> (새 창)</span>
                            </a>
                          ) : (
                            article.title
                          )}
                        </h3>
                        <p className="typo-caption text-muted-foreground">
                          {article.publisherName ?? article.source}
                          {article.publishedAt && (
                            <>
                              {" "}
                              ·{" "}
                              <time dateTime={article.publishedAt}>
                                {materialTime(article.publishedAt, news.data.data.country)}
                              </time>
                            </>
                          )}
                          {article.linkKind === "NAVER" && " · 네이버 뉴스 링크"}
                        </p>
                        {article.summary && (
                          <p className="max-w-prose typo-body-sm wrap-break-word text-muted-foreground">
                            {article.summary}
                          </p>
                        )}
                      </li>
                    ))}
                  </Separated>
                </ul>
              )}
            </div>
          )}
        </Tabs.Content>
        <Tabs.Content value="disclosures" className="min-w-0">
          {disclosures.isPending && <p className="typo-body-sm text-muted-foreground">로딩중</p>}
          {disclosures.isError && (
            <div role="alert" className="flex flex-col items-start gap-3 py-4">
              <p className="typo-body-sm">
                {disclosures.error instanceof ApiError
                  ? disclosures.error.message
                  : "공시를 불러올 수 없습니다."}
              </p>
              {disclosures.error instanceof ApiError && disclosures.error.status === 503 ? (
                <p className="typo-body-sm text-muted-foreground">잠시 후 다시 확인해 주세요.</p>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={disclosures.isFetching}
                  onClick={() => disclosures.refetch()}
                >
                  공시 다시 불러오기
                </Button>
              )}
            </div>
          )}
          {disclosures.data && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1 typo-caption text-muted-foreground">
                <p>
                  최근 30일 · 최신순 최대 100건 · {disclosures.data.data.source}
                  {disclosures.data.data.windowPrecision === "DATE_EXPANDED"
                    ? " · 접수일 기준"
                    : disclosures.data.data.windowPrecision === "EXACT"
                      ? " · 미국 동부 시각"
                      : ""}
                </p>
                <p>공시 요약은 제공되지 않습니다.</p>
                {disclosures.data.data.fetchedAt && (
                  <p>
                    수집 시각{" "}
                    {materialTime(disclosures.data.data.fetchedAt, disclosures.data.data.country)}
                  </p>
                )}
                {disclosures.data.data.coverage === "PARTIAL" && (
                  <p>확인된 공시만 표시합니다. 조회 기간의 일부 공시가 누락됐을 수 있습니다.</p>
                )}
              </div>
              {disclosures.data.data.coverage === "UNMAPPED" ? (
                <p className="py-8 typo-body-sm text-muted-foreground">
                  종목과 공시 제공 기관의 법인 정보를 연결하지 못했습니다.
                </p>
              ) : disclosures.data.data.items.length === 0 ? (
                <p className="py-8 typo-body-sm text-muted-foreground">조회된 공시가 없습니다.</p>
              ) : (
                <ul className="flex flex-col gap-5">
                  <Separated
                    by={
                      <li aria-hidden="true">
                        <Separator />
                      </li>
                    }
                  >
                    {disclosures.data.data.items.map((filing, index) => (
                      <li
                        key={`${filing.provider}-${filing.providerDocumentId}-${index}`}
                        className="flex min-w-0 flex-col gap-2"
                      >
                        <h3 className="typo-heading-xs wrap-break-word">
                          {filing.url ? (
                            <a
                              className="hover:text-primary hover:underline"
                              href={filing.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {filing.title}
                              <ExternalLink
                                aria-hidden="true"
                                className="ml-1 inline size-3.5 align-baseline"
                              />
                              <span className="sr-only"> (새 창)</span>
                            </a>
                          ) : (
                            filing.title
                          )}
                        </h3>
                        <p className="typo-caption text-muted-foreground">
                          {filing.provider}
                          {filing.formLabel && ` · ${filing.formLabel}`}
                          {filing.publishedAt ? (
                            <>
                              {" "}
                              · 접수 시각{" "}
                              <time dateTime={filing.publishedAt}>
                                {materialTime(filing.publishedAt, disclosures.data.data.country)}
                              </time>
                            </>
                          ) : filing.filedDate ? (
                            <>
                              {" "}
                              · 접수일 <time dateTime={filing.filedDate}>{filing.filedDate}</time>
                            </>
                          ) : null}
                        </p>
                      </li>
                    ))}
                  </Separated>
                </ul>
              )}
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </section>
  )
}
