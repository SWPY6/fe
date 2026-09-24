import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { useArgs } from "storybook/preview-api"
import { fn } from "storybook/test"
import { MarketSelector, type Market } from "./MarketSelector"
import { MarketContext } from "./MarketContext"
const meta = {
  title: "Common/MarketSelector",
  component: MarketSelector,
  args: { value: "domestic", onChange: fn() },
  argTypes: { value: { control: "inline-radio", options: ["domestic", "overseas"] } },
  render: function Render(args) {
    const [, updateArgs] = useArgs<{ value: Market }>()
    return (
      <div className="space-y-3">
        <MarketSelector
          {...args}
          onChange={(value) => {
            args.onChange(value)
            updateArgs({ value })
          }}
        >
          <MarketContext
            label={args.value === "domestic" ? "한국 주식" : "미국 주식"}
            currency={args.value === "domestic" ? "KRW" : "USD"}
            sampleCount={36}
          />
        </MarketSelector>
        <p className="text-xs text-muted-foreground">
          좌우 화살표·Home·End로 시장을 선택할 수 있습니다.
        </p>
      </div>
    )
  },
} satisfies Meta<typeof MarketSelector>
export default meta
type Story = StoryObj<typeof meta>
export const Domestic: Story = {}
export const Overseas: Story = { args: { value: "overseas" } }
