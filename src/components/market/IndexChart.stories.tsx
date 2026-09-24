import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { IndexChart } from "./IndexChart"
import { chartSeries, emptyChartSeries } from "./chart.fixtures"
import { exampleTimestamp } from "./market.fixtures"
const meta = {
  title: "Market/IndexChart",
  component: IndexChart,
  render: (args) => (
    <IndexChart key={`${args.initialPeriod}-${args.initialShape}-${args.initialZoom}`} {...args} />
  ),
  args: {
    name: "KOSPI",
    value: 2684.32,
    change: 1.24,
    unit: "pt",
    timestamp: exampleTimestamp,
    series: chartSeries,
    initialPeriod: "1m",
    initialShape: "line",
    initialZoom: 1,
  },
  argTypes: {
    initialPeriod: { control: "select", options: ["1m", "3m", "6m", "1y"] },
    initialShape: { control: "inline-radio", options: ["line", "area"] },
    initialZoom: { control: { type: "number", min: 1, max: 4, step: 1 } },
  },
} satisfies Meta<typeof IndexChart>
export default meta
type Story = StoryObj<typeof meta>
export const OneMonth: Story = {}
export const ThreeMonths: Story = { args: { initialPeriod: "3m" } }
export const SixMonths: Story = { args: { initialPeriod: "6m" } }
export const OneYear: Story = { args: { initialPeriod: "1y" } }
export const Area: Story = { args: { initialShape: "area" } }
export const Zoomed: Story = { args: { initialZoom: 4 } }
export const Empty: Story = { args: { series: emptyChartSeries } }
export const Flat: Story = {
  args: {
    series: {
      ...chartSeries,
      "1m": chartSeries["1m"].map(({ date }) => ({ date, value: 2684.32 })),
    },
    change: 0,
  },
}
export const SinglePoint: Story = {
  args: { series: { ...emptyChartSeries, "1m": [{ date: "2026-09-04", value: 2684.32 }] } },
}
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
