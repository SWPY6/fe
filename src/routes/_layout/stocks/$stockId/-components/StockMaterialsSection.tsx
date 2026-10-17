// oxlint-disable react/no-array-index-key
import { Suspense } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import { QueryErrorResetBoundary } from "@tanstack/react-query"
import { Link, getRouteApi } from "@tanstack/react-router"
import { ExternalLink } from "lucide-react"
import { useState } from "react"
import { Separated } from "react-simplikit"

import { ApiError } from "@/api/http/error"
import { getErrorDescription } from "@/api/query/errorPolicy"
import { Button } from "@/components/ui/button"
import { QueryErrorBoundary } from "@/components/ui/QueryErrorBoundary"
import { Result } from "@/components/ui/Result"
import { Separator } from "@/components/ui/separator"
import { Tabs } from "@/components/ui/tabs"

import {
  getDisclosuresMaterialQueryOptions,
  getNewsMaterialQueryOptions,
} from "./materialQueryOptions"

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
  const [material, setMaterial] = useState("news")

  return (
    <section aria-labelledby="stock-materials-title" className="flex min-w-0 flex-col gap-6">
      <h2 id="stock-materials-title" className="typo-section-heading">
        관련 뉴스·공시
      </h2>
      <Tabs.Root value={material} onValueChange={setMaterial} className="gap-6">
        <Tabs.List variant="underline" aria-label="관련 자료 종류">
          <Tabs.Trigger value="news">뉴스</Tabs.Trigger>
          <Tabs.Trigger value="disclosures">공시</Tabs.Trigger>
        </Tabs.List>
        <div className="min-w-0">
          <Suspense data-skeleton>
            <Tabs.Content
              value="news"
              forceMount
              className="flex min-w-0 flex-col gap-5 data-[state=inactive]:hidden"
            >
              <QueryErrorResetBoundary>
                <QueryErrorBoundary
                  shouldCatch={ApiError}
                  fallback={({ error, reset }) => (
                    <Result
                      role="alert"
                      title={
                        error.data?.error.code === "P002"
                          ? "종목을 찾을 수 없습니다"
                          : "뉴스를 불러오지 못했습니다"
                      }
                      description={getErrorDescription(error)}
                      button={
                        error.data?.error.code === "P002" ? (
                          <Result.Button asChild>
                            <Link to="/movers">다른 종목 찾기</Link>
                          </Result.Button>
                        ) : (
                          <Result.Button onClick={reset}>다시 시도</Result.Button>
                        )
                      }
                    />
                  )}
                >
                  {material === "news" && (
                    <SuspenseQuery {...getNewsMaterialQueryOptions(stockId)}>
                      {({ data: response, error, refetch, isFetching }) => (
                        <>
                          {error && (
                            <div className="flex flex-wrap items-center gap-3">
                              <output className="typo-helper text-muted-foreground">
                                뉴스를 갱신하지 못했습니다. 마지막으로 받은 정보를 표시합니다.{" "}
                                {error instanceof ApiError && getErrorDescription(error)}
                              </output>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isFetching}
                                onClick={() => refetch()}
                              >
                                다시 시도
                              </Button>
                            </div>
                          )}
                          <p className="typo-caption text-muted-foreground">
                            총 {response.data.total}건
                          </p>
                          {response.data.items.length === 0 ? (
                            <p className="py-8 typo-body-sm text-muted-foreground">
                              뉴스가 없습니다.
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
                                {response.data.items.map((article, index) => (
                                  <li
                                    key={`${article.documentId}-${index}`}
                                    className="relative flex min-w-0 flex-col gap-2"
                                  >
                                    <h3 className="typo-heading-xs wrap-break-word">
                                      {article.url ? (
                                        <a
                                          className="after:absolute after:inset-0 hover:text-primary hover:underline focus-visible:after:outline-2 focus-visible:after:outline-ring"
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
                                            {materialTime(
                                              article.publishedAt,
                                              response.data.country,
                                            )}
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
                        </>
                      )}
                    </SuspenseQuery>
                  )}
                </QueryErrorBoundary>
              </QueryErrorResetBoundary>
            </Tabs.Content>
            <Tabs.Content
              value="disclosures"
              forceMount
              className="flex min-w-0 flex-col gap-5 data-[state=inactive]:hidden"
            >
              <QueryErrorResetBoundary>
                <QueryErrorBoundary
                  shouldCatch={ApiError}
                  fallback={({ error, reset }) => (
                    <Result
                      role="alert"
                      title={
                        error.data?.error.code === "P002"
                          ? "종목을 찾을 수 없습니다"
                          : "공시를 불러오지 못했습니다"
                      }
                      description={getErrorDescription(error)}
                      button={
                        error.data?.error.code === "P002" ? (
                          <Result.Button asChild>
                            <Link to="/movers">다른 종목 찾기</Link>
                          </Result.Button>
                        ) : (
                          <Result.Button onClick={reset}>다시 시도</Result.Button>
                        )
                      }
                    />
                  )}
                >
                  {material === "disclosures" && (
                    <SuspenseQuery {...getDisclosuresMaterialQueryOptions(stockId)}>
                      {({ data: response, error, refetch, isFetching }) => (
                        <>
                          {error && (
                            <div className="flex flex-wrap items-center gap-3">
                              <output className="typo-helper text-muted-foreground">
                                공시를 갱신하지 못했습니다. 마지막으로 받은 정보를 표시합니다.{" "}
                                {error instanceof ApiError && getErrorDescription(error)}
                              </output>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isFetching}
                                onClick={() => refetch()}
                              >
                                다시 시도
                              </Button>
                            </div>
                          )}
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
                          {response.data.coverage !== "UNMAPPED" &&
                            response.data.items.length === 0 && (
                              <p className="py-8 typo-body-sm text-muted-foreground">
                                공시가 없습니다.
                              </p>
                            )}
                          {response.data.coverage !== "UNMAPPED" &&
                            response.data.items.length > 0 && (
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
                                      className="relative flex min-w-0 flex-col gap-2"
                                    >
                                      <h3 className="typo-heading-xs wrap-break-word">
                                        {filing.url ? (
                                          <a
                                            className="after:absolute after:inset-0 hover:text-primary hover:underline focus-visible:after:outline-2 focus-visible:after:outline-ring"
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
                                              {materialTime(
                                                filing.publishedAt,
                                                response.data.country,
                                              )}
                                            </time>
                                          </>
                                        )}
                                        {!filing.publishedAt && filing.filedDate && (
                                          <>
                                            {" "}
                                            · 접수일{" "}
                                            <time dateTime={filing.filedDate}>
                                              {filing.filedDate}
                                            </time>
                                          </>
                                        )}
                                      </p>
                                    </li>
                                  ))}
                                </Separated>
                              </ul>
                            )}
                        </>
                      )}
                    </SuspenseQuery>
                  )}
                </QueryErrorBoundary>
              </QueryErrorResetBoundary>
            </Tabs.Content>
          </Suspense>
        </div>
      </Tabs.Root>
    </section>
  )
}
