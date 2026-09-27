/* oxlint-disable better-tailwindcss/no-unknown-classes -- Layout classes are defined in tokens.css. */
import type { Meta, StoryObj } from "@storybook/react-vite"

import "./tokens.css"

const colorGroups = [
  {
    title: "화면과 글자",
    colors: [
      { label: "화면 배경", name: "background" },
      { label: "기본 글자", name: "foreground" },
      { label: "콘텐츠 표면", name: "card" },
      { label: "표면 위 글자", name: "card-foreground" },
      { label: "팝업 표면", name: "popover" },
      { label: "팝업 글자", name: "popover-foreground" },
      { label: "구분선", name: "border" },
      { label: "입력 테두리", name: "input" },
    ],
  },
  {
    title: "동작과 상태",
    colors: [
      { label: "주요 동작", name: "primary" },
      { label: "주요 동작의 글자", name: "primary-foreground" },
      { label: "보조 동작", name: "secondary" },
      { label: "보조 동작의 글자", name: "secondary-foreground" },
      { label: "옅은 배경", name: "muted" },
      { label: "보조 글자", name: "muted-foreground" },
      { label: "선택 영역", name: "accent" },
      { label: "선택 영역의 글자", name: "accent-foreground" },
      { label: "위험 동작", name: "destructive" },
      { label: "위험 동작의 글자", name: "destructive-foreground" },
      { label: "선택 테두리", name: "ring" },
    ],
  },
  {
    title: "시세",
    colors: [
      { label: "상승", name: "positive" },
      { label: "하락", name: "negative" },
      { label: "변동 없음", name: "neutral" },
      { label: "상승 배경", name: "positive-soft" },
      { label: "하락 배경", name: "negative-soft" },
      { label: "중립 배경", name: "neutral-soft" },
      { label: "상승 차트 영역", name: "positive-area" },
      { label: "차트 영역 끝", name: "positive-clear" },
    ],
  },
]

const typographyGroups = [
  {
    title: "제목",
    styles: [
      {
        label: "페이지 제목",
        name: "page-title",
        className: "typo-page-title",
        sample: "오늘 시장의 흐름",
      },
      {
        label: "섹션 제목",
        name: "section-heading",
        className: "typo-section-heading",
        sample: "산업별 동향",
      },
      { label: "작은 제목", name: "subheading", className: "typo-subheading", sample: "주요 지수" },
      { label: "항목 제목", name: "heading-xs", className: "typo-heading-xs", sample: "시장 요약" },
    ],
  },
  {
    title: "본문과 안내",
    styles: [
      {
        label: "본문",
        name: "body",
        className: "typo-body",
        sample: "오늘의 시장 흐름을 확인하세요.",
      },
      {
        label: "작은 본문",
        name: "body-sm",
        className: "typo-body-sm",
        sample: "오늘의 시장 흐름을 확인하세요.",
      },
      { label: "라벨", name: "label", className: "typo-label", sample: "관심 종목" },
      { label: "작은 라벨", name: "label-sm", className: "typo-label-sm", sample: "관심 종목" },
      {
        label: "가장 작은 라벨",
        name: "label-xs",
        className: "typo-label-xs",
        sample: "관심 종목",
      },
      {
        label: "강조 라벨",
        name: "label-strong",
        className: "typo-label-strong",
        sample: "관심 종목",
      },
      {
        label: "짧은 설명",
        name: "caption",
        className: "typo-caption",
        sample: "직전 거래일 종가 대비",
      },
      { label: "도움말", name: "helper", className: "typo-helper", sample: "검색어를 입력하세요." },
    ],
  },
  {
    title: "표",
    styles: [
      {
        label: "표 머리글",
        name: "table-header",
        className: "typo-table-header",
        sample: "현재가",
      },
      { label: "표 항목", name: "table-label", className: "typo-table-label", sample: "삼성전자" },
      { label: "표 값", name: "table-value", className: "typo-table-value", sample: "72,400원" },
    ],
  },
  {
    title: "숫자",
    styles: [
      { label: "큰 숫자", name: "numeric-lg", className: "typo-numeric-lg", sample: "2,674.31" },
      { label: "중간 숫자", name: "numeric-md", className: "typo-numeric-md", sample: "2,674.31" },
      {
        label: "밀집형 숫자",
        name: "numeric-compact",
        className: "typo-numeric-compact",
        sample: "2,674.31",
      },
      { label: "작은 숫자", name: "numeric-sm", className: "typo-numeric-sm", sample: "2,674.31" },
    ],
  },
  {
    title: "브랜드",
    styles: [
      { label: "워드마크", name: "wordmark", className: "typo-wordmark", sample: "ploutos." },
      {
        label: "작은 워드마크",
        name: "wordmark-sm",
        className: "typo-wordmark-sm",
        sample: "ploutos.",
      },
    ],
  },
]

const radii = [
  { label: "Small", name: "sm", className: "rounded-sm" },
  { label: "Medium", name: "md", className: "rounded-md" },
  { label: "Large", name: "lg", className: "rounded-lg" },
  { label: "Extra large", name: "xl", className: "rounded-xl" },
]

const spacing = [1, 2, 3, 4, 6, 8, 12]

function TokensPage() {
  return (
    <main className="tokens-page">
      <div className="tokens-shell">
        <header className="tokens-header">
          <div>
            <h1>디자인 토큰</h1>
            <p>화면을 이루는 색, 글자, 간격과 표면</p>
          </div>
          <span className="tokens-brand typo-wordmark-sm">ploutos.</span>
        </header>

        <nav className="tokens-nav" aria-label="토큰 목록">
          <a href="#colors">색상</a>
          <a href="#typography">글자</a>
          <a href="#foundations">간격과 표면</a>
        </nav>

        <section id="colors" className="tokens-section">
          <div className="tokens-section-heading">
            <h2>색상</h2>
            <p>같은 색도 쓰임에 따라 다른 이름을 가집니다.</p>
          </div>
          <div className="tokens-color-groups">
            {colorGroups.map((group) => (
              <div key={group.title} className="tokens-group">
                <h3>{group.title}</h3>
                <ul className="tokens-color-grid">
                  {group.colors.map(({ label, name }) => (
                    <li key={name} className="tokens-color-item">
                      <span className="tokens-color-preview" aria-hidden="true">
                        <span style={{ backgroundColor: `var(--${name})` }} />
                      </span>
                      <span className="tokens-color-label">
                        <strong>{label}</strong>
                        <code>--{name}</code>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="tokens-market-example" aria-label="시세 색상 사용 예시">
            <span>등락률 표기</span>
            <strong className="text-positive">+2.84%</strong>
            <strong className="text-negative">-1.18%</strong>
            <strong className="text-neutral">0.00%</strong>
          </div>
        </section>

        <section id="typography" className="tokens-section">
          <div className="tokens-section-heading">
            <h2>글자</h2>
            <p>기본 글꼴은 Pretendard Variable입니다.</p>
          </div>
          {typographyGroups.map((group) => (
            <div key={group.title} className="tokens-group tokens-type-group">
              <h3>{group.title}</h3>
              <ul className="tokens-type-list">
                {group.styles.map(({ label, name, className, sample }) => (
                  <li key={name} className="tokens-type-item">
                    <span className="tokens-type-label">
                      <strong>{label}</strong>
                      <code>typo-{name}</code>
                    </span>
                    <span className={`${className} tokens-type-sample`}>{sample}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="tokens-weight-list" aria-label="글자 굵기">
            <span className="font-normal">보통 · 400</span>
            <span className="font-medium">중간 · 500</span>
            <span className="font-semibold">강조 · 600</span>
            <span className="font-bold">굵게 · 700</span>
          </div>
        </section>

        <section id="foundations" className="tokens-section">
          <div className="tokens-section-heading">
            <h2>간격과 표면</h2>
            <p>4px 간격 단위와 모서리, 그림자를 적용한 모습입니다.</p>
          </div>
          <div className="tokens-foundation-grid">
            <div className="tokens-foundation-block">
              <h3>간격</h3>
              <ul className="tokens-spacing-list">
                {spacing.map((step) => (
                  <li key={step}>
                    <span>{step * 4}px</span>
                    <span
                      className="tokens-spacing-bar"
                      style={{ width: `calc(var(--spacing) * ${step})` }}
                    />
                  </li>
                ))}
              </ul>
              <code>--spacing · 4px</code>
            </div>
            <div className="tokens-foundation-block">
              <h3>모서리</h3>
              <ul className="tokens-radius-list">
                {radii.map(({ label, name, className }) => (
                  <li key={name}>
                    <span className={`tokens-radius-preview ${className}`} aria-hidden="true" />
                    <strong>{label}</strong>
                    <code>radius-{name}</code>
                  </li>
                ))}
              </ul>
            </div>
            <div className="tokens-foundation-block tokens-surface-block">
              <h3>표면 그림자</h3>
              <div className="tokens-shadow-preview shadow-surface">콘텐츠 표면</div>
              <code>shadow-surface</code>
            </div>
          </div>
          <div className="tokens-container-block">
            <span>콘텐츠 최대 너비</span>
            <strong>80rem · 1280px</strong>
            <div className="tokens-container-track">
              <div className="tokens-container-width" />
            </div>
            <code>container-7xl</code>
          </div>
        </section>
      </div>
    </main>
  )
}

const meta = {
  title: "디자인 시스템/토큰",
  parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  name: "전체 보기",
  render: () => <TokensPage />,
}
