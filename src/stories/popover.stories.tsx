import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../components/ui/button"
import { Popover } from "../components/ui/popover"

const meta = {
  title: "Components/Popover",
  component: Popover.Root,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Popover.Root>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  name: "기본",
  render: () => (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline">팝오버 열기</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Header>
          <Popover.Title>알림</Popover.Title>
          <Popover.Description>
            관심 종목의 변동 내역을 여기서 확인할 수 있습니다.
          </Popover.Description>
        </Popover.Header>
      </Popover.Content>
    </Popover.Root>
  ),
}
