import type { NewsGroup } from "./KeyNewsList"

export const newsGroups: NewsGroup[] = [
  {
    id: "semiconductor",
    industry: "반도체",
    trend: "up",
    change: 2.43,
    summary:
      "예시 반도체 산업은 상승으로 표시됩니다. 다음 보도·공시는 산업 관련 맥락을 함께 살펴보기 위한 샘플입니다.",
    selectionReason:
      "예시 등락률 상위 산업이며 같은 산업의 뉴스와 공시를 함께 제시합니다. 인과관계를 검증한 결과가 아닙니다.",
    stocks: [{ ticker: "DEMO01", name: "예시 반도체 1" }],
    articles: [
      {
        kind: "news",
        title: "반도체 생산 시설에 관한 예시 보도",
        source: "가상 뉴스 · 정적 fixture",
        publishedAt: "2026-09-04T09:00:00+09:00",
        publishedAtLabel: "2026.09.04 09:00 KST",
        summary:
          "생산 시설과 공급망에 관한 기사 내용을 표현한 디자인용 예시입니다. 실제 보도나 투자 권유가 아닙니다.",
        originalUrl: "https://example.com/",
      },
      {
        kind: "disclosure",
        title: "예시 기업 분기보고서 공시",
        source: "가상 공시 · 정적 fixture",
        publishedAt: "2026-09-04T10:00:00+09:00",
        publishedAtLabel: "2026.09.04 10:00 KST",
        summary: "분기보고서의 요약을 표시하기 위한 가상의 공시입니다.",
        originalUrl: "https://example.com/",
      },
    ],
  },
  {
    id: "telecom",
    industry: "통신",
    trend: "down",
    change: -2.15,
    summary:
      "예시 통신 산업은 하락으로 표시됩니다. 아래 항목은 산업 동향을 설명하는 샘플이며 하락의 원인으로 단정할 수 없습니다.",
    selectionReason: "예시 등락률 하위 산업의 관련 맥락을 비교하기 위해 선택했습니다.",
    stocks: [{ ticker: "DEMO81", name: "예시 통신 1" }],
    articles: [
      {
        kind: "news",
        title: "통신 서비스 동향을 설명하는 예시 기사",
        source: "가상 뉴스 · 정적 fixture",
        publishedAt: "2026-09-04T11:00:00+09:00",
        publishedAtLabel: "2026.09.04 11:00 KST",
        summary: "통신 서비스 변화에 대한 화면 확인용 요약입니다. 실제 사건을 설명하지 않습니다.",
        originalUrl: "https://example.com/",
      },
    ],
  },
]
