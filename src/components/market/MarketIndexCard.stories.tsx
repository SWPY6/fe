import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { fn } from "storybook/test"
import { MarketIndexCard } from "./MarketIndexCard"
import { domesticIndicators } from "./market.fixtures"
const meta = {
  title: "Market/MarketIndexCard",
  component: MarketIndexCard,
  args: { indicator: domesticIndicators[0] },
} satisfies Meta<typeof MarketIndexCard>
export default meta
type Story = StoryObj<typeof meta>
export const Rising: Story = {}
export const Falling: Story = { args: { indicator: domesticIndicators[1] } }
export const FlatExchangeRate: Story = { args: { indicator: domesticIndicators[2] } }
export const OilUnit: Story = { args: { indicator: domesticIndicators[3] } }
export const Selectable: Story = { args: { onSelect: fn() } }
export const LongValue: Story = {
  args: {
    indicator: {
      id: "long",
      name: "긴 지표명과 숫자 예시",
      value: 1234567890.12,
      unit: "KRW / USD",
      change: null,
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
}
