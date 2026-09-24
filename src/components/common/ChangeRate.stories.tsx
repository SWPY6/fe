import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { ChangeRate } from "./ChangeRate"

const meta = {
  title: "Common/ChangeRate",
  component: ChangeRate,
  args: { value: 3.24 },
  argTypes: {
    value: {
      control: "number",
      description: "퍼센트 단위 등락률. 소수점 둘째 자리까지 표시합니다.",
    },
  },
} satisfies Meta<typeof ChangeRate>

export default meta
type Story = StoryObj<typeof meta>

export const Positive: Story = {}
export const Negative: Story = { args: { value: -1.22 } }
export const Flat: Story = { args: { value: 0 } }
export const RoundedToZero: Story = { args: { value: -0.001 } }
export const PositiveRoundedToZero: Story = { args: { value: 0.001 } }
export const Missing: Story = { args: { value: null } }
export const Undefined: Story = { args: { value: undefined } }
export const NonFinite: Story = { args: { value: Number.NaN } }
export const PositiveInfinity: Story = { args: { value: Number.POSITIVE_INFINITY } }
export const NegativeInfinity: Story = { args: { value: Number.NEGATIVE_INFINITY } }
