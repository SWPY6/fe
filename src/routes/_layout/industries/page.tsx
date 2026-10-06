import { ErrorBoundary } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { BoneSuspense } from "boneyard-js/react"
import { Pin } from "lucide-react"
import { useStorageState } from "react-simplikit"

import { getReadTrendsSuspenseQueryOptions } from "@/api/generated/api"
import { PriceNumber } from "@/components/domain/PriceNumber"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table } from "@/components/ui/table"
import { Tabs } from "@/components/ui/tabs"
import { useGlobalUrlState } from "@/hooks/useGlobalUrlState"

import industryListBones from "./-industry-list.bones.json"
import { industryFilterSchema } from "./-schema"

const route = getRouteApi("/_layout/industries/")

export function IndustriesPage() {
  const [{ market }, setGlobalUrlState] = useGlobalUrlState()
  const { filter } = route.useSearch()
  const navigate = route.useNavigate()
  const [pinned, setPinned] = useStorageState<{ domestic: string[]; overseas: string[] }>(
    "industry-pins",
    { defaultValue: { domestic: [], overseas: [] } },
  )

  return (
    <main className="py-8">
      <Tabs.Root
        value={market}
        onValueChange={(value) => {
          if (value === "domestic" || value === "overseas") {
            setGlobalUrlState({ market: value })
          }
        }}
        className="gap-8"
      >
        <Tabs.List variant="segmented" aria-label="시장 선택">
          <Tabs.Trigger value="domestic">국내 시장</Tabs.Trigger>
          <Tabs.Trigger value="overseas">해외 시장</Tabs.Trigger>
        </Tabs.List>
        <Separator />
        <Tabs.Content key={market} value={market} className="min-w-0">
          <section className="flex flex-col gap-6" aria-labelledby="industry-title">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 id="industry-title" className="typo-section-heading">
                  산업별로 묶어 보는 주요 종목
                </h1>
                <p className="mt-1 typo-body-sm text-muted-foreground">
                  산업별 대표 종목을 확인하세요. 고정은 시장별로 최대 3개까지 저장됩니다.
                </p>
              </div>
              <fieldset className="inline-flex rounded-md bg-accent p-1">
                <legend className="sr-only">산업 등락 필터</legend>
                {industryFilterSchema.options.map((value) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={filter === value ? "default" : "ghost"}
                    onClick={() =>
                      navigate({
                        search: (previous) => ({ ...previous, filter: value }),
                        resetScroll: false,
                      })
                    }
                  >
                    {{ ALL: "전체", RISING: "상승 산업", FALLING: "하락 산업" }[value]}
                  </Button>
                ))}
              </fieldset>
            </div>
            <div className="flex flex-col gap-8">
              <p className="typo-caption text-muted-foreground">고정 {pinned[market].length}/3</p>
              <ErrorBoundary key={`${market}-${filter}`} fallback="오류가 발생했습니다">
                <BoneSuspense
                  name="industry-list"
                  select="viewport"
                  initialBones={industryListBones}
                >
                  <SuspenseQuery
                    {...getReadTrendsSuspenseQueryOptions({
                      country: market === "domestic" ? "KR" : "US",
                      filter,
                    })}
                  >
                    {({ data: response }) => {
                      const industries = response.data.toSorted(function pinnedFirst(a, b) {
                        return (
                          Number(pinned[market].includes(b.code ?? "")) -
                          Number(pinned[market].includes(a.code ?? ""))
                        )
                      })
                      return industries.length === 0 ? (
                        "표시할 산업이 없습니다"
                      ) : (
                        <div className="grid gap-x-7 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                          {industries.map((industry) => {
                            const isPinned = pinned[market].includes(industry.code ?? "")
                            return (
                              <div key={industry.code} className="flex min-w-0 flex-col gap-8">
                                <Separator />
                                <section className="flex min-w-0 flex-col gap-6">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <h2 className="typo-subheading">{industry.displayName}</h2>
                                      <p className="mt-1 typo-caption text-muted-foreground">
                                        평균 등락률 {industry.rank}위 ·{" "}
                                        {industry.avgChangeRate == null ? (
                                          "—"
                                        ) : (
                                          <PriceNumber
                                            value={industry.avgChangeRate}
                                            format={{
                                              style: "unit",
                                              unit: "percent",
                                              signDisplay: "exceptZero",
                                            }}
                                          />
                                        )}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      aria-pressed={isPinned}
                                      disabled={
                                        !industry.code || (!isPinned && pinned[market].length >= 3)
                                      }
                                      onClick={() => {
                                        setPinned((current) => {
                                          if (!industry.code) return current
                                          if (current[market].includes(industry.code)) {
                                            return {
                                              ...current,
                                              [market]: current[market].filter(
                                                (code) => code !== industry.code,
                                              ),
                                            }
                                          }
                                          if (current[market].length >= 3) return current
                                          return {
                                            ...current,
                                            [market]: [...current[market], industry.code],
                                          }
                                        })
                                      }}
                                    >
                                      <Pin className="size-4" aria-hidden="true" />
                                      {isPinned ? "고정 해제하기" : "상단에 고정하기"}
                                    </Button>
                                  </div>
                                  <Table.Root className="min-w-0 table-fixed">
                                    <Table.Header>
                                      <Table.Row>
                                        <Table.Head>종목</Table.Head>
                                        <Table.Head className="text-right">현재가</Table.Head>
                                        <Table.Head className="text-right">등락률</Table.Head>
                                      </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                      {industry.stocks?.map((stock) => (
                                        <Table.Row key={stock.ticker} className="h-17">
                                          <Table.Cell>
                                            <span className="block truncate typo-table-label">
                                              {stock.stockId == null ? (
                                                stock.name
                                              ) : (
                                                <Link
                                                  to="/stocks/$stockId"
                                                  params={{ stockId: String(stock.stockId) }}
                                                  className="hover:text-primary hover:underline"
                                                >
                                                  {stock.name}
                                                </Link>
                                              )}
                                            </span>
                                            <span className="typo-caption text-muted-foreground">
                                              {stock.ticker}
                                            </span>
                                          </Table.Cell>
                                          <Table.Cell className="text-right">
                                            {stock.price == null ? (
                                              "—"
                                            ) : (
                                              <PriceNumber
                                                value={stock.price}
                                                format={{
                                                  style: "currency",
                                                  currency: industry.currency,
                                                  currencyDisplay: "code",
                                                }}
                                                className="text-foreground"
                                              />
                                            )}
                                          </Table.Cell>
                                          <Table.Cell className="text-right">
                                            {stock.changeRate == null ? (
                                              "—"
                                            ) : (
                                              <PriceNumber
                                                value={stock.changeRate}
                                                format={{
                                                  style: "unit",
                                                  unit: "percent",
                                                  signDisplay: "exceptZero",
                                                }}
                                              />
                                            )}
                                          </Table.Cell>
                                        </Table.Row>
                                      ))}
                                      {!industry.stocks?.length && (
                                        <Table.Row>
                                          <Table.Cell colSpan={3}>
                                            표시할 종목이 없습니다
                                          </Table.Cell>
                                        </Table.Row>
                                      )}
                                    </Table.Body>
                                  </Table.Root>
                                  <Link
                                    to="/movers"
                                    search={(previous) => ({
                                      ...previous,
                                      industry: industry.code,
                                      page: 1,
                                      sort: "ALL",
                                    })}
                                    className="self-start typo-label-sm text-primary hover:underline"
                                  >
                                    산업 종목 전체 보기
                                  </Link>
                                </section>
                              </div>
                            )
                          })}
                        </div>
                      )
                    }}
                  </SuspenseQuery>
                </BoneSuspense>
              </ErrorBoundary>
            </div>
          </section>
        </Tabs.Content>
      </Tabs.Root>
    </main>
  )
}
