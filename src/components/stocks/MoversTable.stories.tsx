import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { MoversTable } from "./MoversTable"
import { domesticMovers, overseasMovers } from "./stocks.fixtures"
import { exampleTimestamp } from "../market/market.fixtures"
const meta = {
  title: "Stocks/MoversTable",
  component: MoversTable,
  render: (args) => (
    <MoversTable
      key={`${args.initialPage}-${args.initialSort?.key}-${args.initialSort?.direction}`}
      {...args}
    />
  ),
  args: {
    rows: domesticMovers,
    marketLabel: "국내시장",
    currency: "KRW",
    timestamp: exampleTimestamp,
    initialPage: 1,
  },
} satisfies Meta<typeof MoversTable>
export default meta
type Story = StoryObj<typeof meta>
export const DomesticUnsorted: Story = {}
export const Overseas: Story = {
  args: { rows: overseasMovers, marketLabel: "해외시장", currency: "USD" },
}
export const SortedDescending: Story = {
  args: { initialSort: { key: "change", direction: "desc" } },
}
export const SortedAscending: Story = { args: { initialSort: { key: "price", direction: "asc" } } }
export const SecondPage: Story = { args: { initialPage: 2 } }
export const LastPage: Story = { args: { initialPage: 5 } }
export const Empty: Story = { args: { rows: [] } }
export const LongName: Story = {
  args: {
    rows: [
      {
        ...domesticMovers[0],
        name: "여러 산업의 사업부와 글로벌 연구개발 조직을 함께 운영하는 아주 긴 이름의 예시 기업",
        reason:
          "산업 동향과 공시를 함께 확인하는 긴 예시 맥락입니다. 실제 가격 변화의 원인을 설명하지 않습니다.",
      },
      ...domesticMovers.slice(1),
    ],
  },
}
export const NarrowWidth: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}
