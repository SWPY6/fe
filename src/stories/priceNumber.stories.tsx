import type { Meta, StoryObj } from "@storybook/react-vite"

import { PriceNumber } from "../components/domain/PriceNumber"

const meta = {
  title: "Components/PriceNumber",
  component: PriceNumber,
  args: { value: 0 },
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof PriceNumber>

export default meta
type Story = StoryObj<typeof meta>

export const Values: Story = {
  name: "값에 따른 색상",
  render: () => (
    <div className="flex items-center gap-8 text-xl font-semibold">
      <PriceNumber value={2.34} format={{ signDisplay: "always" }} />
      <PriceNumber value={-1.12} format={{ signDisplay: "always" }} />
      <PriceNumber value={0} format={{ signDisplay: "exceptZero" }} />
    </div>
  ),
}

export const Formatting: Story = {
  name: "숫자 포맷",
  render: () => (
    <div className="flex flex-col gap-3 text-lg font-semibold">
      <PriceNumber value={12345.6} />
      <PriceNumber value={12345.6} format={{ signDisplay: "always" }} />
      <PriceNumber value={12345.6} format={{ maximumFractionDigits: 0 }} />
      <PriceNumber value={0.0234} format={{ style: "percent", signDisplay: "always" }} />
    </div>
  ),
}

export const Elements: Story = {
  name: "태그 변경",
  render: () => (
    <div className="flex items-center gap-8 text-lg">
      <PriceNumber value={1234} />
      <PriceNumber as="strong" value={1234} title="강조된 가격" />
      <PriceNumber as="a" href="#price-number" value={1234} className="underline" />
    </div>
  ),
}
