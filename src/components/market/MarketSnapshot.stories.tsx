import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { MarketSnapshot } from "./MarketSnapshot"
import { domesticIndicators, overseasIndicators, exampleTimestamp } from "./market.fixtures"
const meta = {
  title: "Market/MarketSnapshot",
  component: MarketSnapshot,
  args: { title: "국내시장 요약", indicators: domesticIndicators, timestamp: exampleTimestamp },
} satisfies Meta<typeof MarketSnapshot>
export default meta
type Story = StoryObj<typeof meta>
export const Domestic: Story = {}
export const Overseas: Story = { args: { title: "해외시장 요약", indicators: overseasIndicators } }
export const Empty: Story = { args: { indicators: [] } }
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
