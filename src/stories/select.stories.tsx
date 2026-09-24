import type { Meta, StoryObj } from "@storybook/react-vite"

import { Select } from "../components/ui/select"

const meta = {
  title: "Components/Select",
  component: Select.Root,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Select.Root>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  name: "기본 선택",
  render: () => (
    <div className="grid gap-2 text-sm">
      <span>시장 선택</span>
      <Select.Root defaultValue="domestic">
        <Select.Trigger className="w-52" aria-label="시장 선택">
          <Select.Value placeholder="시장을 선택하세요" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="domestic">국내</Select.Item>
          <Select.Item value="overseas">해외</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  ),
}

export const SizesAndGroups: Story = {
  name: "크기와 그룹",
  render: () => (
    <div className="flex flex-wrap items-end gap-6">
      <div className="grid gap-2 text-sm">
        <span>기본 크기</span>
        <Select.Root>
          <Select.Trigger className="w-44" aria-label="지수 선택">
            <Select.Value placeholder="지수 선택" />
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              <Select.Label>국내 지수</Select.Label>
              <Select.Item value="kospi">KOSPI</Select.Item>
              <Select.Item value="kosdaq">KOSDAQ</Select.Item>
            </Select.Group>
            <Select.Separator />
            <Select.Group>
              <Select.Label>해외 지수</Select.Label>
              <Select.Item value="sp500">S&amp;P 500</Select.Item>
              <Select.Item value="nasdaq">NASDAQ</Select.Item>
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </div>
      <div className="grid gap-2 text-sm">
        <span>작은 크기</span>
        <Select.Root defaultValue="kospi">
          <Select.Trigger size="sm" className="w-32" aria-label="지수 선택, 작은 크기">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="kospi">KOSPI</Select.Item>
            <Select.Item value="kosdaq">KOSDAQ</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  ),
}
