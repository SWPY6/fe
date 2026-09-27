import type { Meta, StoryObj } from "@storybook/react-vite"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import * as React from "react"

import { Carousel, type CarouselApi } from "../components/ui/carousel"

const industries = [
  { name: "자동차", change: "+1.61%", stocks: ["현대차 +3.24%", "현대모비스 -0.78%"] },
  { name: "건설", change: "+0.45%", stocks: ["현대건설 +1.68%", "GS건설 -1.22%"] },
  { name: "운송", change: "+0.34%", stocks: ["대한항공 +1.92%", "HMM -0.34%"] },
  { name: "유통", change: "+0.21%", stocks: ["이마트 +0.82%", "롯데쇼핑 -0.25%"] },
  { name: "음식료", change: "+0.12%", stocks: ["오리온 +0.61%", "CJ제일제당 -0.12%"] },
  { name: "통신", change: "+0.04%", stocks: ["SK텔레콤 +0.35%", "KT -0.27%"] },
  { name: "철강", change: "-0.08%", stocks: ["POSCO홀딩스 +0.44%", "현대제철 -0.60%"] },
  { name: "에너지", change: "-0.17%", stocks: ["S-Oil +0.22%", "한국전력 -0.56%"] },
  { name: "화학", change: "-0.35%", stocks: ["LG화학 +0.19%", "롯데케미칼 -0.89%"] },
]

function IndustryFlowExample() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [paused, setPaused] = React.useState(false)
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (!api) return () => {}
      api.on("select", onChange)
      api.on("reInit", onChange)
      return () => {
        api.off("select", onChange)
        api.off("reInit", onChange)
      }
    },
    [api],
  )
  const selectedIndex = React.useSyncExternalStore(
    subscribe,
    () => api?.selectedScrollSnap() ?? 0,
    () => 0,
  )

  function toggleAutoplay() {
    const autoplay = api?.plugins().autoplay
    if (!autoplay) return
    if (paused) autoplay.play()
    else autoplay.stop()
    setPaused(!paused)
  }

  return (
    <Carousel.Root
      aria-label="오늘의 산업 흐름"
      autoplay={{ delay: 3000, stopOnInteraction: false, stopOnFocusIn: false }}
      opts={{ loop: true }}
      setApi={setApi}
      className="w-[min(880px,calc(100vw-3rem))] rounded-2xl border bg-card p-7 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-md bg-blue-50 px-2 py-1 font-semibold text-blue-700">
            오늘의 산업 흐름
          </span>
          <span className="text-muted-foreground tabular-nums">
            {selectedIndex + 1} / {industries.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="이전 산업"
            onClick={() => api?.scrollPrev()}
            className="inline-flex size-9 items-center justify-center rounded-lg border text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label={paused ? "자동 전환 재개" : "자동 전환 일시 정지"}
            onClick={toggleAutoplay}
            className="inline-flex size-9 items-center justify-center rounded-lg border text-muted-foreground hover:text-foreground"
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
          <button
            type="button"
            aria-label="다음 산업"
            onClick={() => api?.scrollNext()}
            className="inline-flex size-9 items-center justify-center rounded-lg border text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-8">
        <Carousel.Content>
          {industries.map((industry, index) => (
            <Carousel.Item key={industry.name}>
              <div className="min-h-44">
                <p className="text-xs text-muted-foreground">
                  평균 등락률 {index + 1}위 · 소속 종목 4개 단순평균
                </p>
                <h2 className="mt-4 text-2xl/snug font-semibold tracking-tight">
                  {industry.name} 관련 종목의 평균 등락률은
                  <br />
                  <span
                    className={industry.change.startsWith("+") ? "text-red-600" : "text-blue-600"}
                  >
                    {industry.change}
                  </span>
                  였어요.
                </h2>
                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                  <span className="rounded-md border px-3 py-1.5 font-medium text-blue-700">
                    {industry.name} 종목 보기
                  </span>
                  {industry.stocks.map((stock) => (
                    <span key={stock} className="text-muted-foreground">
                      {stock}
                    </span>
                  ))}
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel.Content>
      </div>

      <div className="mt-4 flex gap-1.5" aria-label="산업 선택">
        {industries.map((industry, index) => (
          <button
            key={industry.name}
            type="button"
            aria-label={`${industry.name} 산업 보기`}
            aria-current={selectedIndex === index ? "true" : undefined}
            onClick={() => api?.scrollTo(index)}
            className={
              selectedIndex === index
                ? "h-2 w-6 rounded-full bg-blue-600"
                : "size-2 rounded-full bg-slate-300"
            }
          />
        ))}
      </div>
    </Carousel.Root>
  )
}

const meta = {
  title: "Components/Carousel",
  component: Carousel.Root,
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "시각 디자인보다 캐러셀의 전환 동작과 제어 API를 확인하는 스토리입니다. 자동 재생, 반복 이동, 이전·다음 탐색을 살펴보세요.",
      },
    },
  },
} satisfies Meta<typeof Carousel.Root>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  name: "자동 재생과 탐색",
  render: () => (
    <Carousel.Root
      aria-label="캐러셀 동작 예시"
      autoplay={{ delay: 3000, stopOnInteraction: false }}
      opts={{ loop: true }}
      className="w-80"
    >
      <Carousel.Content>
        {["첫 번째", "두 번째", "세 번째"].map((label) => (
          <Carousel.Item key={label}>
            <div className="flex h-40 items-center justify-center rounded-xl border bg-muted text-2xl font-semibold">
              {label}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
    </Carousel.Root>
  ),
}

export const IndustryFlow: Story = {
  name: "오늘의 산업 흐름 데모",
  render: () => <IndustryFlowExample />,
}
