import type { Meta, StoryObj } from "@storybook/react-vite"

import { Tabs } from "../components/ui/tabs"

const meta = {
  title: "Components/Tabs",
  component: Tabs.Root,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Tabs.Root>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  name: "기본 탭",
  render: () => (
    <Tabs.Root defaultValue="domestic" className="w-80">
      <Tabs.List>
        <Tabs.Trigger value="domestic">국내</Tabs.Trigger>
        <Tabs.Trigger value="overseas">해외</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="domestic" className="pt-3 text-sm">
        국내 시장 내용
      </Tabs.Content>
      <Tabs.Content value="overseas" className="pt-3 text-sm">
        해외 시장 내용
      </Tabs.Content>
    </Tabs.Root>
  ),
}

export const Line: Story = {
  name: "선형 탭",
  render: () => (
    <Tabs.Root defaultValue="overview" className="w-80">
      <Tabs.List variant="line">
        <Tabs.Trigger value="overview">시장 요약</Tabs.Trigger>
        <Tabs.Trigger value="industries">산업별 동향</Tabs.Trigger>
        <Tabs.Trigger value="movers">주요 변동 종목</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview" className="pt-3 text-sm">
        시장 요약 내용
      </Tabs.Content>
      <Tabs.Content value="industries" className="pt-3 text-sm">
        산업별 동향 내용
      </Tabs.Content>
      <Tabs.Content value="movers" className="pt-3 text-sm">
        주요 변동 종목 내용
      </Tabs.Content>
    </Tabs.Root>
  ),
}
