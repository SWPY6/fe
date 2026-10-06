// oxlint-disable react/no-array-index-key
import { ErrorBoundary } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { BoneSuspense } from "boneyard-js/react"
import { ExternalLink } from "lucide-react"
import { Separated } from "react-simplikit"

import {
  getDisclosuresSuspenseQueryOptions,
  getNewsSuspenseQueryOptions,
} from "@/api/generated/api"
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

  return (
    <section aria-labelledby="stock-materials-title" className="flex min-w-0 flex-col gap-6">
      <h2 id="stock-materials-title" className="typo-section-heading">
        관련 뉴스·공시
      </h2>
      <Tabs.Root defaultValue="news" className="gap-6">
        <Tabs.List variant="underline" aria-label="관련 자료 종류">
          <Tabs.Trigger value="news">뉴스</Tabs.Trigger>
          <Tabs.Trigger value="disclosures">공시</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="news" forceMount className="min-w-0 data-[state=inactive]:hidden">
          <ErrorBoundary fallback="오류가 발생했습니다">
            <BoneSuspense select="viewport">
              <SuspenseQuery {...getNewsSuspenseQueryOptions(stockId)}>
                {({ data: response }) => (
                  <div className="flex flex-col gap-5">
                    <p className="typo-caption text-muted-foreground">총 {response.data.total}건</p>
                    {response.data.items.length === 0 ? (
                      <p className="py-8 typo-body-sm text-muted-foreground">뉴스가 없습니다.</p>
                    ) : (
                      <ul className="flex flex-col gap-5">
                        <Separated
                          by={
                            <li aria-hidden="true">
                              <Separator />
                            </li>
                          }
                        >
                          {response.data.items.map((article, index) => (
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
                                      {materialTime(article.publishedAt, response.data.country)}
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
              </SuspenseQuery>
            </BoneSuspense>
          </ErrorBoundary>
        </Tabs.Content>
        <Tabs.Content
          value="disclosures"
          forceMount
          className="min-w-0 data-[state=inactive]:hidden"
        >
          <ErrorBoundary fallback="오류가 발생했습니다">
            <BoneSuspense select="viewport">
              <SuspenseQuery {...getDisclosuresSuspenseQueryOptions(stockId)}>
                {({ data: response }) => (
                  <div className="flex flex-col gap-5">
                    {response.data.coverage !== "UNMAPPED" && (
                      <p className="typo-caption text-muted-foreground">
                        총 {response.data.total}건
                      </p>
                    )}
                    {response.data.coverage === "UNMAPPED" && (
                      <p className="py-8 typo-body-sm text-muted-foreground">
                        공시를 조회할 수 없습니다.
                      </p>
                    )}
                    {response.data.coverage !== "UNMAPPED" && response.data.items.length === 0 && (
                      <p className="py-8 typo-body-sm text-muted-foreground">공시가 없습니다.</p>
                    )}
                    {response.data.coverage !== "UNMAPPED" && response.data.items.length > 0 && (
                      <ul className="flex flex-col gap-5">
                        <Separated
                          by={
                            <li aria-hidden="true">
                              <Separator />
                            </li>
                          }
                        >
                          {response.data.items.map((filing, index) => (
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
                                {filing.publishedAt && (
                                  <>
                                    {" "}
                                    · 접수 시각{" "}
                                    <time dateTime={filing.publishedAt}>
                                      {materialTime(filing.publishedAt, response.data.country)}
                                    </time>
                                  </>
                                )}
                                {!filing.publishedAt && filing.filedDate && (
                                  <>
                                    {" "}
                                    · 접수일{" "}
                                    <time dateTime={filing.filedDate}>{filing.filedDate}</time>
                                  </>
                                )}
                              </p>
                            </li>
                          ))}
                        </Separated>
                      </ul>
                    )}
                  </div>
                )}
              </SuspenseQuery>
            </BoneSuspense>
          </ErrorBoundary>
        </Tabs.Content>
      </Tabs.Root>
    </section>
  )
}
