import type { Meta, StoryObj } from "@storybook/react-vite"
import { Info } from "lucide-react"

import { Button } from "../components/ui/button"
import { Tooltip } from "../components/ui/tooltip"

const meta = {
  title: "Components/Tooltip",
  component: Tooltip.Root,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Tooltip.Root>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  name: "기본",
  render: () => (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button variant="outline" size="icon" aria-label="등락률 설명">
            <Info />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>전일 종가 대비 변동률</Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  ),
}
