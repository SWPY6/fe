import type { Meta, StoryObj } from "@storybook/react-vite"

import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  name: "기본",
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="market-alerts" defaultChecked />
      <Label htmlFor="market-alerts">시장 알림 받기</Label>
    </div>
  ),
}

export const States: Story = {
  name: "상태",
  render: () => (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Switch id="switch-unchecked" />
        <Label htmlFor="switch-unchecked">꺼짐</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-checked" defaultChecked />
        <Label htmlFor="switch-checked">켜짐</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-disabled" disabled />
        <Label htmlFor="switch-disabled" className="text-muted-foreground">
          비활성
        </Label>
      </div>
    </div>
  ),
}
