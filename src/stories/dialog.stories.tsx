import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../components/ui/button"
import { Dialog } from "../components/ui/dialog"

const meta = {
  title: "Components/Dialog",
  component: Dialog.Root,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Dialog.Root>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  name: "기본",
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>대화상자 열기</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>알림 설정</Dialog.Title>
          <Dialog.Description>관심 종목의 변동 알림을 받을 수 있습니다.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="outline">취소</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button>확인</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
}

export const Destructive: Story = {
  name: "삭제 확인",
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="destructive">관심 종목 삭제</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>관심 종목을 삭제할까요?</Dialog.Title>
          <Dialog.Description>삭제한 종목은 관심 목록에서 사라집니다.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="outline">취소</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button variant="destructive">삭제</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ),
}
