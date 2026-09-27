import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

const meta = {
  title: "Components/Label",
  component: Label,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const WithInput: Story = {
  name: "입력 필드",
  render: () => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="stock-name">종목명</Label>
      <Input id="stock-name" placeholder="종목명을 입력하세요" />
    </div>
  ),
}
