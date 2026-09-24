import type { Meta, StoryObj } from "@storybook/react-vite"

import { Separator } from "../components/ui/separator"

const meta = {
  title: "Components/Separator",
  component: Separator,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Directions: Story = {
  name: "가로와 세로",
  render: () => (
    <div className="w-72 space-y-6 text-sm">
      <div className="space-y-3">
        <span>시장 요약</span>
        <Separator />
        <span>주요 지수</span>
      </div>
      <div className="flex h-6 items-center gap-4">
        <span>국내</span>
        <Separator orientation="vertical" />
        <span>해외</span>
      </div>
    </div>
  ),
}
