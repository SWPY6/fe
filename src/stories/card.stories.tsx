import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"

const meta = {
  title: "Components/Card",
  component: Card.Root,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Card.Root>

export default meta
type Story = StoryObj<typeof meta>

export const Information: Story = {
  name: "정보 카드",
  render: () => (
    <Card.Root className="w-80">
      <Card.Header>
        <Card.Title>시장 요약</Card.Title>
        <Card.Description>오늘의 주요 지표</Card.Description>
      </Card.Header>
      <Card.Content>
        <p className="text-2xl font-semibold">2,734.12</p>
        <p className="text-sm text-positive">+1.25%</p>
      </Card.Content>
    </Card.Root>
  ),
}

export const WithActions: Story = {
  name: "동작이 있는 카드",
  render: () => (
    <Card.Root className="w-80">
      <Card.Header>
        <Card.Title>관심 종목</Card.Title>
        <Card.Description>등록한 종목의 움직임을 확인하세요.</Card.Description>
        <Card.Action>
          <Button size="sm" variant="ghost">
            편집
          </Button>
        </Card.Action>
      </Card.Header>
      <Card.Content>아직 등록한 종목이 없습니다.</Card.Content>
      <Card.Footer className="border-t">
        <Button>종목 추가</Button>
      </Card.Footer>
    </Card.Root>
  ),
}
