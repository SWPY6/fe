import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { fn } from "storybook/test"
import { KeyNewsList } from "./KeyNewsList"
import { newsGroups } from "./news.fixtures"
const meta = {
  title: "News/KeyNewsList",
  component: KeyNewsList,
  args: { groups: newsGroups },
} satisfies Meta<typeof KeyNewsList>
export default meta
type Story = StoryObj<typeof meta>
export const RisingAndFalling: Story = {}
export const NewsAndDisclosure: Story = { args: { groups: [newsGroups[0]] } }
export const RelatedStockAction: Story = { args: { onStockSelect: fn() } }
export const LongContent: Story = {
  args: {
    groups: [
      {
        ...newsGroups[0],
        summary: newsGroups[0].summary.repeat(4),
        selectionReason: newsGroups[0].selectionReason.repeat(3),
        articles: [
          {
            ...newsGroups[0].articles[0],
            title: "산업 동향과 여러 기업의 생산 및 공급망 변화를 함께 살펴보는 긴 예시 기사 제목",
            summary: newsGroups[0].articles[0].summary.repeat(5),
          },
        ],
      },
    ],
  },
}
export const Empty: Story = { args: { groups: [] } }
export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}
