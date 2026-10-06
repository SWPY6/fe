import { ErrorBoundary } from "@suspensive/react"
import { SuspenseQuery } from "@suspensive/react-query"
import { Link } from "@tanstack/react-router"
import { BoneSuspense } from "boneyard-js/react"
import { Pause, Play } from "lucide-react"
import { useEffect, useState } from "react"
import { useBooleanState } from "react-simplikit"

import { getReadFlowsSuspenseQueryOptions } from "@/api/generated/api"
import { PriceNumber } from "@/components/domain/PriceNumber"
import { Button } from "@/components/ui/button"
import { Carousel, type CarouselApi } from "@/components/ui/carousel"
import { useGlobalUrlState } from "@/hooks/useGlobalUrlState"

import industryFlowBones from "./industry-flow.bones.json"

export function IndustryFlowCarousel() {
  const [{ market }] = useGlobalUrlState()
  const [api, setApi] = useState<CarouselApi>()
  const [isPlaying, markPlaying, markStopped] = useBooleanState(false)

  useEffect(
    function subscribeToAutoplay() {
      if (!api) return

      function syncPlaybackState() {
        if (api?.plugins().autoplay?.isPlaying()) markPlaying()
        else markStopped()
      }

      syncPlaybackState()
      api.on("autoplay:play", markPlaying)
      api.on("autoplay:stop", markStopped)
      api.on("reInit", syncPlaybackState)
      return () => {
        api.off("autoplay:play", markPlaying)
        api.off("autoplay:stop", markStopped)
        api.off("reInit", syncPlaybackState)
      }
    },
    [api, markPlaying, markStopped],
  )

  return (
    <ErrorBoundary fallback="오류가 발생했습니다">
      <BoneSuspense name="industry-flow" select="viewport" initialBones={industryFlowBones}>
        <SuspenseQuery
          {...getReadFlowsSuspenseQueryOptions({ country: market === "domestic" ? "KR" : "US" })}
        >
          {({ data: response }) =>
            response.data.length === 0 ? (
              "산업 흐름이 없습니다"
            ) : (
              <Carousel.Root
                aria-label="오늘의 산업 흐름"
                autoplay={{ delay: 3000 }}
                opts={{ loop: true }}
                setApi={setApi}
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="typo-section-heading">오늘의 산업 흐름</h2>
                  <div className="flex items-center gap-2">
                    <Carousel.Previous aria-label="이전 산업" className="static translate-0" />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-full"
                      aria-label={isPlaying ? "자동 전환 일시 정지" : "자동 전환 재개"}
                      disabled={!api || response.data.length < 2}
                      onClick={() => {
                        const autoplay = api?.plugins().autoplay
                        if (autoplay?.isPlaying()) autoplay.stop()
                        else autoplay?.play()
                      }}
                    >
                      {isPlaying ? <Pause /> : <Play />}
                    </Button>
                    <Carousel.Next aria-label="다음 산업" className="static translate-0" />
                  </div>
                </div>
                <Carousel.Content className="mt-6">
                  {response.data.map((industry) => (
                    <Carousel.Item key={industry.code}>
                      <p className="typo-caption text-muted-foreground">
                        평균 등락률 {industry.rank}위 · 소속 종목 {industry.stockCount}개 단순평균
                      </p>
                      <h3 className="mt-3 typo-section-heading">
                        {industry.displayName} 관련 종목의 평균 등락률은{" "}
                        {industry.avgChangeRate == null ? (
                          "—"
                        ) : (
                          <PriceNumber
                            value={industry.avgChangeRate}
                            format={{ style: "unit", unit: "percent", signDisplay: "exceptZero" }}
                          />
                        )}
                      </h3>
                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 typo-label-sm">
                        <Link to="/industries" className="text-primary hover:underline">
                          {industry.displayName} 산업 보기
                        </Link>
                        {industry.majorStocks?.map((stock) => (
                          <span key={stock.ticker}>
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
                            )}{" "}
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
                          </span>
                        ))}
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel.Content>
              </Carousel.Root>
            )
          }
        </SuspenseQuery>
      </BoneSuspense>
    </ErrorBoundary>
  )
}
