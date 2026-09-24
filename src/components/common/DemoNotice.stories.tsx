import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { DemoNotice } from "./DemoNotice"
const meta = { title: "Common/DemoNotice", component: DemoNotice } satisfies Meta<typeof DemoNotice>
export default meta
type Story = StoryObj<typeof meta>
export const Standard: Story = {}
export const LongMessage: Story = {
  args: {
    message:
      "화면에 표시되는 모든 가격, 등락률, 그래프, 기사와 공시는 디자인 검증을 위해 만든 정적 예시입니다. 기준 시각은 fixture에 지정된 고정 시각이며 현재 시각을 나타내지 않습니다. 출처는 PLOUTOS 예시 데이터이고 실제 시장 정보나 투자 예측이 아닙니다.",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}
