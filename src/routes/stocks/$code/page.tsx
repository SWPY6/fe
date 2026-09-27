import { Link, useParams } from "@tanstack/react-router"
import { ArrowRight, Bell } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"

const data = {
  asOf: "예시 2026.09.04 · 15:30 KST · 직전 거래일 종가 대비",
  stock: {
    name: "현대차",
    code: "005380",
    industry: "자동차",
    price: "248,000",
    change: "+3.24%",
    reason: "수요 및 실적 개선 기대 · 예시 · 자동차 산업의 흐름과 연결한 설명 예시입니다.",
  },
  news: [
    {
      time: "09.04 14:00 KST",
      title: "현대차, 수요 및 실적 개선 기대 · 예시",
      body: "자동차 산업의 변화가 현대차에 어떤 영향을 주는지 설명하는 뉴스 요약 예시입니다. 수요 변화와 기업 실적을 함께 살펴보는 구성을 보여줍니다.",
    },
    {
      time: "09.04 13:00 KST",
      title: "자동차 산업, 다음 거래일 확인할 변수",
      body: "원자재 가격, 수요 동향, 기업 발표 일정 등을 확인하는 뉴스 요약 예시입니다.",
    },
  ],
  notices: [
    {
      time: "09.04 14:00 KST",
      title: "현대차 분기보고서",
      body: "분기 매출, 영업이익, 사업 현황과 주요 위험 요인을 확인하는 보고서 화면 예시입니다. 실제 제출된 문서를 인용하지 않았습니다.",
    },
    {
      time: "09.04 13:00 KST",
      title: "현대차 기업설명회 개최 안내",
      body: "기업설명회의 일시, 대상, 주요 설명 내용을 확인하는 공시 화면 예시입니다. 실제 행사 일정이 아닙니다.",
    },
  ],
  chart: [
    44, 52, 54, 42, 37, 49, 55, 48, 43, 51, 58, 53, 46, 45, 54, 65, 66, 57, 44, 45, 56, 64, 62, 52,
    49, 55, 68, 69, 58, 55, 63, 72, 69, 59, 53, 61, 70, 75, 68, 60, 60, 69, 78, 76, 66, 60, 69, 79,
    79, 70, 64, 67, 77, 85, 81, 72, 70, 78, 88, 87, 76, 70, 74, 85, 91, 87,
  ],
  metrics: [
    ["전일 종가", "240,217원"],
    ["시가", "244,280원"],
    ["고가", "251,224원"],
    ["저가", "241,056원"],
    ["거래량", "245,000주"],
    ["평소 거래량 대비", "0.95배"],
    ["시가총액", "86.6조원"],
    ["거래대금", "608억원"],
  ],
}

export function StockPage() {
  const { code } = useParams({ from: "/stocks/$code/" })
  const [range, setRange] = useState("3개월")
  const [alertSet, setAlertSet] = useState(true)
  const points = data.chart.slice(
    range === "1개월" ? -22 : range === "3개월" ? -44 : range === "6개월" ? -55 : 0,
  )
  const chartPoints = points
    .map((value, index) => `${(index * 820) / (points.length - 1)},${200 - value * 1.6}`)
    .join(" ")

  return (
    <>
      <main className="pt-9 pb-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-7">
          <div>
            <p className="typo-caption text-muted-foreground">시장 개요</p>
            <h1 className="mt-3 typo-page-title">종목 상세</h1>
          </div>
          <p className="typo-caption text-muted-foreground">{data.asOf}</p>
        </div>
        <Tabs.Root defaultValue="domestic" className="mt-6 gap-0">
          <div className="flex flex-wrap items-center gap-4">
            <Tabs.List variant="segmented" aria-label="시장 선택">
              <Tabs.Trigger value="domestic">국내 시장</Tabs.Trigger>
              <Tabs.Trigger value="overseas">해외 시장</Tabs.Trigger>
            </Tabs.List>
            <span className="typo-body-sm text-muted-foreground">
              한국 주식 · KRW · 36개 예시 종목
            </span>
          </div>
          <Tabs.Content value="domestic">
            {code === data.stock.code ? (
              <>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <p className="typo-label-sm">
                    <Link to="/industries" className="text-primary hover:underline">
                      {data.stock.industry} ↗
                    </Link>
                    <span className="mx-4 text-muted-foreground">/</span>
                    {data.stock.name}
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/movers">종목 검색·산업 필터</Link>
                  </Button>
                </div>
                <nav
                  aria-label="종목 상세 목차"
                  className="mt-8 overflow-x-auto border-b border-border"
                >
                  <ul className="flex w-max min-w-full gap-7 typo-label-sm">
                    <li>
                      <a
                        href="#stock-summary"
                        className="block border-b-2 border-primary p-3 text-primary"
                      >
                        종목 요약 정보
                      </a>
                    </li>
                    <li>
                      <a
                        href="#stock-news"
                        className="block p-3 text-muted-foreground hover:text-primary"
                      >
                        관련 뉴스·공시
                      </a>
                    </li>
                    <li>
                      <a
                        href="#stock-chart"
                        className="block p-3 text-muted-foreground hover:text-primary"
                      >
                        차트 및 주요 지표
                      </a>
                    </li>
                  </ul>
                </nav>
                <section
                  id="stock-summary"
                  className="mt-6 border-t border-border pt-6"
                  aria-labelledby="summary-title"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 id="summary-title" className="typo-section-heading">
                      종목 요약 정보
                    </h2>
                    <p className="typo-body-sm text-muted-foreground">
                      선택한 예시 종목 · {data.stock.code}
                    </p>
                  </div>
                  <div className="mt-7 flex flex-wrap items-center gap-x-12 gap-y-5">
                    <div className="flex items-center gap-4">
                      <span className="flex size-9 items-center justify-center rounded-md bg-accent text-primary">
                        현
                      </span>
                      <div>
                        <h3 className="typo-subheading">{data.stock.name}</h3>
                        <p className="typo-body-sm text-muted-foreground">
                          {data.stock.industry} · {data.stock.code}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="typo-numeric-md">{data.stock.price}원</p>
                      <p className="typo-body text-positive tabular-nums">{data.stock.change}</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setAlertSet(!alertSet)}
                    >
                      <Bell className="size-4" />
                      가격 알림 {alertSet ? "설정됨" : "해제됨"}
                    </Button>
                  </div>
                  <div className="mt-7 rounded-lg bg-muted p-5">
                    <p className="typo-label-sm">주가 변동 배경</p>
                    <p className="mt-2 typo-body-sm text-muted-foreground">{data.stock.reason}</p>
                  </div>
                </section>
                <section
                  id="stock-news"
                  className="mt-6 border-t border-border pt-6"
                  aria-labelledby="news-title"
                >
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h2 id="news-title" className="typo-section-heading">
                        관련 뉴스·공시
                      </h2>
                      <p className="mt-1 typo-body-sm text-muted-foreground">
                        현대차의 움직임을 이해하는 근거를 확인하세요.
                      </p>
                    </div>
                    <p className="typo-body-sm text-muted-foreground">
                      예시 콘텐츠 · 뉴스 2건 / 공시 2건
                    </p>
                  </div>
                  <div className="mt-7 grid gap-x-10 gap-y-8 md:grid-cols-2">
                    <div>
                      <h3 className="typo-subheading">관련 뉴스 2</h3>
                      {data.news.map((item) => (
                        <article key={item.title} className="border-b border-border py-6">
                          <p className="typo-caption text-muted-foreground">
                            뉴스 형식 예시 · {item.time}
                          </p>
                          <h4 className="mt-8 typo-heading-xs">{item.title}</h4>
                          <p className="mt-6 typo-body-sm text-muted-foreground">{item.body}</p>
                          <details className="mt-7 typo-label-sm text-primary">
                            <summary className="inline-flex cursor-pointer items-center gap-1">
                              예시 내용 읽기 <ArrowRight className="size-4" />
                            </summary>
                            <p className="mt-3 typo-body-sm text-muted-foreground">{item.body}</p>
                          </details>
                        </article>
                      ))}
                    </div>
                    <div>
                      <h3 className="typo-subheading">공시 2</h3>
                      {data.notices.map((item) => (
                        <article key={item.title} className="border-b border-border py-6">
                          <p className="typo-caption text-muted-foreground">
                            기업 공시 형식 예시 · {item.time}
                          </p>
                          <h4 className="mt-8 typo-heading-xs">{item.title}</h4>
                          <p className="mt-6 typo-body-sm text-muted-foreground">{item.body}</p>
                          <details className="mt-7 typo-label-sm text-primary">
                            <summary className="inline-flex cursor-pointer items-center gap-1">
                              예시 내용 읽기 <ArrowRight className="size-4" />
                            </summary>
                            <p className="mt-3 typo-body-sm text-muted-foreground">{item.body}</p>
                          </details>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
                <section
                  id="stock-chart"
                  className="mt-6 border-t border-border pt-6"
                  aria-labelledby="chart-title"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 id="chart-title" className="typo-section-heading">
                      차트 및 주요 지표
                    </h2>
                    <p className="typo-body-sm text-muted-foreground">
                      기본 라인 · 캔들 선택 · 1개월~1년
                    </p>
                  </div>
                  <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <p className="typo-label-sm">{data.stock.name} · 원</p>
                          <p className="typo-numeric-md">{data.stock.price}</p>
                          <p className="typo-body text-positive">{data.stock.change}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <fieldset className="inline-flex rounded-md bg-accent p-1">
                            <legend className="sr-only">차트 기간</legend>
                            {["1개월", "3개월", "6개월", "1년"].map((value) => (
                              <Button
                                key={value}
                                size="sm"
                                variant={range === value ? "default" : "ghost"}
                                onClick={() => setRange(value)}
                              >
                                {value}
                              </Button>
                            ))}
                          </fieldset>
                          <Button variant="outline" size="sm" disabled>
                            차트 모양 · 라인
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2 typo-helper text-muted-foreground">
                        ● 라인　 --- 직전 거래일 종가 240,216.97
                      </p>
                      <div className="mt-4 rounded-lg bg-muted p-4">
                        <svg
                          viewBox="0 0 900 260"
                          preserveAspectRatio="none"
                          className="h-64 w-full text-positive"
                        >
                          <title>{data.stock.name + " " + range + " 예시 가격 흐름"}</title>
                          <defs>
                            <linearGradient id="stock-chart-area" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {[24, 80, 136, 192, 248].map((y) => (
                            <line key={y} x1="0" x2="820" y1={y} y2={y} stroke="var(--border)" />
                          ))}
                          <polygon
                            points={"0,230 " + chartPoints + " 820,230"}
                            fill="url(#stock-chart-area)"
                          />
                          <polyline
                            points={chartPoints}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            vectorEffect="non-scaling-stroke"
                          />
                          <text x="835" y="30" fill="var(--muted-foreground)" fontSize="12">
                            249,672
                          </text>
                          <text x="835" y="140" fill="var(--muted-foreground)" fontSize="12">
                            244,704
                          </text>
                          <text x="835" y="250" fill="var(--muted-foreground)" fontSize="12">
                            239,736
                          </text>
                        </svg>
                        <div className="mt-1 flex justify-between typo-helper text-muted-foreground">
                          <span>2026.01.07</span>
                          <span>2026.03.08</span>
                          <span>2026.05.10</span>
                          <span>2026.08.12</span>
                        </div>
                      </div>
                      <p className="mt-10 typo-helper text-muted-foreground">
                        거래량 · 주　 --- 최근 20거래일 평균
                      </p>
                      <div
                        className="mt-5 flex h-24 items-end gap-0.5 overflow-hidden border-b border-border"
                        aria-label="거래량 예시 막대 차트"
                      >
                        {data.chart.map((value, index) => (
                          <span
                            key={`${value}-${data.chart.slice(0, index).filter((item) => item === value).length}`}
                            className={
                              index % 3 === 0
                                ? "min-w-0 flex-1 bg-positive/60"
                                : "min-w-0 flex-1 bg-negative/60"
                            }
                            style={{ height: `${Math.max(16, value)}%` }}
                          />
                        ))}
                      </div>
                      <p className="mt-4 typo-helper text-muted-foreground">
                        예시 데이터 · {range} · 차트 위에서 마우스 휠로 표시 범위를 조절할 수
                        있어요.
                      </p>
                    </div>
                    <dl>
                      {data.metrics.map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-3 border-b border-border py-4 typo-body-sm"
                        >
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="text-right tabular-nums">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </section>
              </>
            ) : (
              <div className="py-24 text-center">
                <h2 className="typo-section-heading">
                  이 종목의 예시 상세 정보는 준비되지 않았습니다.
                </h2>
                <p className="mt-3 typo-body-sm text-muted-foreground">
                  현재 현대차(005380) 화면을 확인할 수 있습니다.
                </p>
                <Button asChild className="mt-5">
                  <Link to="/stocks/$code" params={{ code: data.stock.code }}>
                    현대차 상세 보기
                  </Link>
                </Button>
              </div>
            )}
          </Tabs.Content>
          <Tabs.Content
            value="overseas"
            className="py-20 text-center typo-body-sm text-muted-foreground"
          >
            해외 시장 데모 데이터는 준비 중입니다.
          </Tabs.Content>
        </Tabs.Root>
        <p className="mt-10 typo-helper text-muted-foreground">
          DEMO 모든 가격·그래프·뉴스는 디자인용 예시입니다. 실제 시세 또는 투자 예측이 아닙니다.
        </p>
        <p className="mt-6 typo-helper text-muted-foreground">
          실제 거래·알림 발송을 지원하지 않는 디자인 프로토타입입니다. 투자 판단에 사용하지 마세요.
        </p>
      </main>
    </>
  )
}
