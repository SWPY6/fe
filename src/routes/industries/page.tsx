import { Link } from "@tanstack/react-router"
import { ArrowRight, Pin } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Table } from "@/components/ui/table"
import { Tabs } from "@/components/ui/tabs"

const data = {
  asOf: "예시 2026.09.04 · 15:30 KST · 직전 거래일 종가 대비",
  industries: [
    {
      name: "건설",
      rank: 2,
      change: "+0.45%",
      stocks: [
        ["현대건설", "000720", "32,100", "+1.68%"],
        ["대우건설", "047040", "4,120", "+0.49%"],
        ["GS건설", "006360", "18,430", "-1.22%"],
        ["DL이앤씨", "375500", "34,700", "+0.86%"],
      ],
    },
    {
      name: "에너지",
      rank: 8,
      change: "-0.33%",
      stocks: [
        ["S-Oil", "010950", "67,200", "-1.21%"],
        ["GS", "078930", "43,000", "-0.46%"],
        ["SK이노베이션", "096770", "108,000", "+1.04%"],
        ["한국가스공사", "036460", "38,200", "-0.69%"],
      ],
    },
    {
      name: "운송",
      rank: 3,
      change: "+0.42%",
      stocks: [
        ["대한항공", "003490", "22,400", "+1.92%"],
        ["HMM", "011200", "17,200", "-0.58%"],
        ["팬오션", "028670", "5,230", "+1.16%"],
        ["제주항공", "089590", "9,430", "-0.84%"],
      ],
    },
    {
      name: "유통",
      rank: 4,
      change: "+0.36%",
      stocks: [
        ["이마트", "139480", "62,100", "+0.74%"],
        ["롯데쇼핑", "023530", "61,500", "-0.32%"],
        ["신세계", "004170", "169,800", "+1.20%"],
        ["현대백화점", "069960", "67,300", "-0.18%"],
      ],
    },
    {
      name: "음식료",
      rank: 5,
      change: "+0.34%",
      stocks: [
        ["농심", "004370", "412,000", "+0.91%"],
        ["오뚜기", "007310", "410,000", "+0.62%"],
        ["CJ제일제당", "097950", "325,000", "-0.53%"],
        ["오리온", "271560", "92,000", "+0.34%"],
      ],
    },
    {
      name: "자동차",
      rank: 1,
      change: "+1.61%",
      stocks: [
        ["현대차", "005380", "248,000", "+3.24%"],
        ["기아", "000270", "102,000", "+1.85%"],
        ["현대모비스", "012330", "254,500", "-0.78%"],
        ["한온시스템", "018880", "4,320", "+2.13%"],
      ],
    },
    {
      name: "철강",
      rank: 7,
      change: "-0.06%",
      stocks: [
        ["현대제철", "004020", "28,700", "-1.82%"],
        ["동국제강", "460860", "9,200", "-0.65%"],
        ["세아베스틸지주", "001430", "24,150", "+1.26%"],
        ["대한제강", "084010", "12,340", "+0.98%"],
      ],
    },
    {
      name: "통신",
      rank: 6,
      change: "+0.15%",
      stocks: [
        ["KT", "030200", "39,800", "+0.48%"],
        ["SK텔레콤", "017670", "55,000", "+0.36%"],
        ["LG유플러스", "032640", "10,200", "-0.42%"],
        ["인스코비", "006490", "1,100", "+0.19%"],
      ],
    },
    {
      name: "화학",
      rank: 9,
      change: "-0.35%",
      stocks: [
        ["롯데케미칼", "011170", "92,300", "-2.36%"],
        ["금호석유", "011780", "138,000", "+0.72%"],
        ["한화솔루션", "009830", "27,150", "+1.14%"],
        ["대한유화", "006650", "104,200", "-0.91%"],
      ],
    },
  ],
}

export function IndustriesPage() {
  const [filter, setFilter] = useState("all")
  const [pinned, setPinned] = useState<string[]>([])
  const industries = data.industries
    .filter(
      (industry) =>
        filter === "all" ||
        (filter === "up" ? industry.change.startsWith("+") : industry.change.startsWith("-")),
    )
    .toSorted((a, b) => Number(pinned.includes(b.name)) - Number(pinned.includes(a.name)))

  return (
    <>
      <main className="pt-9 pb-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-7">
          <div>
            <p className="typo-caption text-muted-foreground">시장 개요</p>
            <h1 className="mt-3 typo-page-title">산업별 동향</h1>
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
            <section className="mt-8" aria-labelledby="industry-title">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 id="industry-title" className="typo-subheading">
                    산업별로 묶어 보는 주요 종목
                  </h2>
                  <p className="mt-1 typo-body-sm text-muted-foreground">
                    관심 산업은 최대 3개까지 고정할 수 있습니다. 전체는 산업명 순, 상승·하락은 평균
                    등락률 순으로 표시됩니다.
                  </p>
                </div>
                <fieldset className="inline-flex rounded-md bg-accent p-1">
                  <legend className="sr-only">산업 등락 필터</legend>
                  <Button
                    size="sm"
                    variant={filter === "all" ? "default" : "ghost"}
                    onClick={() => setFilter("all")}
                  >
                    전체
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === "up" ? "default" : "ghost"}
                    onClick={() => setFilter("up")}
                  >
                    상승 산업
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === "down" ? "default" : "ghost"}
                    onClick={() => setFilter("down")}
                  >
                    하락 산업
                  </Button>
                </fieldset>
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-lg bg-muted px-4 py-3 typo-body-sm text-muted-foreground">
                <Pin className="size-4 text-primary" aria-hidden="true" />
                <span className="text-primary">고정 {pinned.length}/3</span>
                <span>
                  평균 등락률은 표시된 산업별 예시 종목의 단순평균이며 실제 업종지수가 아닙니다.
                </span>
              </div>
              <div className="mt-6 grid gap-x-7 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
                {industries.map((industry) => (
                  <section
                    key={industry.name}
                    aria-labelledby={"industry-" + industry.rank}
                    className="min-w-0 border-t border-border pt-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 id={"industry-" + industry.rank} className="typo-subheading">
                          {industry.name}
                        </h3>
                        <p className="mt-1 typo-caption text-muted-foreground">
                          평균 등락률 {industry.rank}위 · {industry.change}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        aria-pressed={pinned.includes(industry.name)}
                        disabled={!pinned.includes(industry.name) && pinned.length === 3}
                        onClick={() =>
                          setPinned((current) =>
                            current.includes(industry.name)
                              ? current.filter((name) => name !== industry.name)
                              : [...current, industry.name],
                          )
                        }
                      >
                        {pinned.includes(industry.name) ? "고정됨" : "고정"}
                      </Button>
                    </div>
                    <Table.Root className="mt-5 min-w-0 table-fixed">
                      <Table.Header>
                        <Table.Row>
                          <Table.Head className="w-2/5">종목</Table.Head>
                          <Table.Head className="text-right">현재가</Table.Head>
                          <Table.Head className="text-right">등락률</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {industry.stocks.map(([name, code, price, change]) => (
                          <Table.Row key={code} className="h-17">
                            <Table.Cell className="overflow-hidden">
                              <span className="block truncate typo-table-label">{name}</span>
                              <span className="typo-caption text-muted-foreground">{code}</span>
                            </Table.Cell>
                            <Table.Cell className="text-right tabular-nums">{price}원</Table.Cell>
                            <Table.Cell
                              className={
                                change.startsWith("+")
                                  ? "text-right text-positive tabular-nums"
                                  : "text-right text-negative tabular-nums"
                              }
                            >
                              {change}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                    <Link
                      to="/movers"
                      className="mt-5 inline-flex items-center gap-1 typo-label-sm text-primary hover:underline"
                    >
                      산업 종목 전체 보기 <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </section>
                ))}
              </div>
            </section>
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
