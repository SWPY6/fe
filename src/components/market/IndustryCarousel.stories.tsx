import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { fn } from "storybook/test"
import { IndustryCarousel } from "./IndustryCarousel"
import { industryFixtures } from "./market.fixtures"
const meta = {
  title: "Market/IndustryCarousel",
  component: IndustryCarousel,
  render: (args) => (
    <IndustryCarousel
      key={`${args.initialIndex}-${args.initialAutoRotate}-${args.initialFixed}`}
      {...args}
    />
  ),
  args: {
    industries: industryFixtures,
    initialIndex: 0,
    initialAutoRotate: false,
    initialFixed: false,
    intervalMs: 5000,
    onSelect: fn(),
  },
  argTypes: {
    initialIndex: { control: { type: "number", min: 0, max: 8, step: 1 } },
    intervalMs: { control: { type: "number", min: 1000, step: 1000 } },
  },
} satisfies Meta<typeof IndustryCarousel>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Automotive: Story = { args: { initialIndex: 1 } }
export const AutoRotating: Story = { args: { initialAutoRotate: true, intervalMs: 2000 } }
export const Paused: Story = { args: { initialIndex: 3 } }
export const Fixed: Story = {
  args: { initialIndex: 2, initialFixed: true, initialAutoRotate: true },
}
export const LastToFirst: Story = { args: { initialIndex: 8 } }
export const FirstToLast: Story = {}
export const Empty: Story = { args: { industries: [] } }
export const NoStocks: Story = {
  args: { industries: [{ ...industryFixtures[0], stocks: [], constituentCount: 0 }] },
}
export const SingleIndustry: Story = { args: { industries: [industryFixtures[0]] } }
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
