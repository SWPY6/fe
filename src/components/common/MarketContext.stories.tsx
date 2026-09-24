import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { MarketContext } from "./MarketContext"
const meta = {
  title: "Common/MarketContext",
  component: MarketContext,
  args: { label: "한국 주식", currency: "KRW", sampleCount: 36 },
} satisfies Meta<typeof MarketContext>
export default meta
type Story = StoryObj<typeof meta>
export const Domestic: Story = {}
export const Overseas: Story = { args: { label: "미국 주식", currency: "USD", sampleCount: 100 } }
