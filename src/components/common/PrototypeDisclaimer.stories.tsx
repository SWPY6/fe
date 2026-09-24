import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { PrototypeDisclaimer } from "./PrototypeDisclaimer"
const meta = { title: "Common/PrototypeDisclaimer", component: PrototypeDisclaimer } satisfies Meta<
  typeof PrototypeDisclaimer
>
export default meta
type Story = StoryObj<typeof meta>
export const Standard: Story = {}
export const LongMessage: Story = {
  args: {
    message:
      "PLOUTOS 화면은 사용자 인터페이스 확인을 위한 프로토타입입니다. 버튼과 탭의 선택은 화면 안에서만 동작하며 실제 주문, 거래, 알림 발송, 회원가입 또는 인증을 수행하지 않습니다. 시장 수치와 뉴스는 모두 가상 예시이며 투자 의사결정에 사용할 수 없습니다.",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}
