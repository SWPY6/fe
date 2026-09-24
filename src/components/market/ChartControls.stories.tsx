import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { useArgs } from "storybook/preview-api"
import { fn } from "storybook/test"
import { ChartControls } from "./ChartControls"
const meta = {
  title: "Market/ChartControls",
  component: ChartControls,
  args: {
    period: "1m",
    shape: "line",
    zoom: 1,
    onPeriodChange: fn(),
    onShapeChange: fn(),
    onZoomChange: fn(),
    onReset: fn(),
  },
  argTypes: {
    period: { control: "select", options: ["1m", "3m", "6m", "1y"] },
    shape: { control: "inline-radio", options: ["line", "area"] },
    zoom: { control: { type: "number", min: 1, max: 4, step: 1 } },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <ChartControls
        {...args}
        onPeriodChange={(period) => {
          args.onPeriodChange(period)
          updateArgs({ period, zoom: 1 })
        }}
        onShapeChange={(shape) => {
          args.onShapeChange(shape)
          updateArgs({ shape })
        }}
        onZoomChange={(zoom) => {
          args.onZoomChange(zoom)
          updateArgs({ zoom })
        }}
        onReset={() => {
          args.onReset()
          updateArgs({ period: "1m", shape: "line", zoom: 1 })
        }}
      />
    )
  },
} satisfies Meta<typeof ChartControls>
export default meta
type Story = StoryObj<typeof meta>
export const OneMonth: Story = {}
export const ThreeMonths: Story = { args: { period: "3m" } }
export const SixMonths: Story = { args: { period: "6m" } }
export const OneYear: Story = { args: { period: "1y" } }
export const Area: Story = { args: { shape: "area" } }
export const MaximumZoom: Story = { args: { zoom: 4 } }
