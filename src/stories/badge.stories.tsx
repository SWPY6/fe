import type { Meta, StoryObj } from "@storybook/react-vite"

import { Badge } from "../components/ui/badge"

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Tones: Story = {
  name: "표시 색상",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex flex-col items-start gap-2">
        <span className="text-sm text-muted-foreground">일반</span>
        <Badge>거래 중</Badge>
      </div>
      <div className="flex flex-col items-start gap-2">
        <span className="text-sm text-muted-foreground">상승</span>
        <Badge tone="positive">+2.34%</Badge>
      </div>
      <div className="flex flex-col items-start gap-2">
        <span className="text-sm text-muted-foreground">하락</span>
        <Badge tone="negative">-1.12%</Badge>
      </div>
    </div>
  ),
}
