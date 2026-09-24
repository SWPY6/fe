import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { RelatedArticleCard } from "./RelatedArticleCard"

const meta = {
  title: "Articles/RelatedArticleCard",
  component: RelatedArticleCard,
  decorators: [
    (Story) => (
      <section className="max-w-xl" aria-label="관련 기사 예시">
        <h2 className="mb-4 text-lg font-semibold">관련 기사</h2>
        <Story />
      </section>
    ),
  ],
  args: {
    kind: "news",
    title: "자동차 산업 관련 뉴스 예시",
    source: "예시 언론사",
    publishedAt: "2026-09-04T14:00:00+09:00",
    publishedAtLabel: "2026.09.04 14:00 KST",
    summary: "이 영역에는 관련 뉴스의 요약 내용이 표시됩니다.",
    originalUrl: "https://example.com/",
  },
  argTypes: {
    kind: { control: "inline-radio", options: ["news", "disclosure"] },
    publishedAt: { control: "text", description: "time 요소의 기계 판독용 날짜 문자열" },
    publishedAtLabel: { control: "text", description: "화면에 표시할 날짜 레이블" },
  },
} satisfies Meta<typeof RelatedArticleCard>

export default meta
type Story = StoryObj<typeof meta>

export const News: Story = {}
export const Disclosure: Story = {
  args: {
    kind: "disclosure",
    title: "분기보고서 공시 예시",
    source: "예시 공시 기관",
    summary: "이 영역에는 기업 공시의 요약 내용이 표시됩니다.",
  },
}
export const LongContent: Story = {
  args: {
    title:
      "자동차 산업의 생산과 공급망 변화에 관한 긴 제목 예시: 여러 줄에 걸쳐 표시되는 기사 제목과 카드의 반응형 줄바꿈 확인",
    summary:
      "이 기사는 화면 표시를 확인하기 위한 정적 예시입니다. 긴 요약이 카드 너비에 맞게 자연스럽게 줄바꿈되는지 확인합니다. 작은 화면에서도 내용을 읽고 원문 링크로 이동할 수 있어야 합니다. 공백없는긴문자열에서도카드바깥으로넘치지않고줄바꿈되는지확인하기위한예시문자열입니다.",
  },
}
export const DifferentTimeLabel: Story = {
  args: {
    publishedAt: "2026-09-04T05:00:00Z",
    publishedAtLabel: "2026년 9월 4일 오후 2시 (한국 시간)",
  },
}
