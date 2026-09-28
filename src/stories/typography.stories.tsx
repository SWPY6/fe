import type { Meta, StoryObj } from "@storybook/react-vite"

import { Typography, type TypographyVariant } from "../components/ui/typography"

const meta = {
  title: "Components/Typography",
  component: Typography,
  args: { variant: "body" },
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

const samples: { variant: TypographyVariant; text: string }[] = [
  { variant: "page-title", text: "오늘 시장의 흐름" },
  { variant: "section-heading", text: "산업별 동향" },
  { variant: "subheading", text: "주요 지수" },
  { variant: "heading-xs", text: "시장 요약" },
  { variant: "body", text: "오늘의 시장 흐름을 확인하세요." },
  { variant: "body-sm", text: "오늘의 시장 흐름을 확인하세요." },
  { variant: "label", text: "관심 종목" },
  { variant: "label-sm", text: "관심 종목" },
  { variant: "label-xs", text: "관심 종목" },
  { variant: "label-strong", text: "관심 종목" },
  { variant: "caption", text: "직전 거래일 종가 대비" },
  { variant: "helper", text: "검색어를 입력하세요." },
  { variant: "table-header", text: "현재가" },
  { variant: "table-label", text: "삼성전자" },
  { variant: "table-value", text: "72,400원" },
  { variant: "numeric-lg", text: "2,674.31" },
  { variant: "numeric-md", text: "2,674.31" },
  { variant: "numeric-compact", text: "2,674.31" },
  { variant: "numeric-sm", text: "2,674.31" },
  { variant: "wordmark", text: "ploutos." },
  { variant: "wordmark-sm", text: "ploutos." },
]

export const Variants: Story = {
  name: "타이포그래피 토큰",
  render: () => (
    <div className="grid gap-6">
      {samples.map(({ variant, text }) => (
        <div key={variant} className="grid gap-1">
          <span className="text-xs text-muted-foreground">{variant}</span>
          <Typography variant={variant}>{text}</Typography>
        </div>
      ))}
    </div>
  ),
}

export const Elements: Story = {
  name: "태그 변경",
  render: () => (
    <div className="grid gap-4">
      <Typography as="h1" variant="page-title">
        시장 요약
      </Typography>
      <Typography as="p" variant="page-title">
        시장 요약
      </Typography>
      <Typography as="a" href="#typography" variant="body-sm" className="underline">
        종목 보기
      </Typography>
    </div>
  ),
}
