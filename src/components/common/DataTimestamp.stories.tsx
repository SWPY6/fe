import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { DataTimestamp } from "./DataTimestamp"
import { exampleTimestamp } from "../market/market.fixtures"
const meta = {
  title: "Common/DataTimestamp",
  component: DataTimestamp,
  args: exampleTimestamp,
} satisfies Meta<typeof DataTimestamp>
export default meta
type Story = StoryObj<typeof meta>
export const Standard: Story = {}
export const OverseasTimeZone: Story = {
  args: {
    dateTime: "2026-09-03T16:00:00-04:00",
    label: "2026.09.03 16:00",
    timeZone: "America/New_York · EDT",
  },
}
export const LongSource: Story = {
  args: {
    source:
      "PLOUTOS 디자인 검증용 가상 데이터 모음 — 실제 거래소와 언론사에서 제공한 자료가 아닙니다.",
    priceBasis: "직전 거래일 종가와 비교한 예시 수치이며 장중 시세를 반영하지 않습니다.",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}
