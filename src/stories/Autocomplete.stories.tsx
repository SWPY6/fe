import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import {
  Autocomplete,
  type AutocompleteOption,
  type AutocompleteProps,
} from "../components/ui/Autocomplete"
import { Button } from "../components/ui/button"
import { Typography } from "../components/ui/typography"

const items = [
  { value: "005930", label: "삼성전자", description: "005930 · KOSPI" },
  { value: "000660", label: "SK하이닉스", description: "000660 · KOSPI" },
  { value: "035420", label: "NAVER", description: "035420 · KOSPI" },
]

const meta = {
  title: "Components/Autocomplete",
  component: Autocomplete,
  parameters: { layout: "padded", controls: { disable: true } },
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    items,
    label: "종목 검색",
    placeholder: "종목명 또는 코드 입력",
    filter: (item, query) =>
      `${item.label} ${item.value}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  },
} satisfies Meta<typeof Autocomplete>

export default meta
type Story = StoryObj<typeof meta>

function SelectionExample(props: AutocompleteProps) {
  const [value, setValue] = useState<AutocompleteOption | null>(null)

  return (
    <div className="grid gap-4">
      <Autocomplete {...props} value={value} onValueChange={setValue} />
      <Typography as="output" variant="body-sm" className="text-muted-foreground">
        {value ? `선택: ${value.label} (${value.value})` : "선택한 항목이 없습니다."}
      </Typography>
      <Button variant="outline" className="w-fit" onClick={() => setValue(null)}>
        선택 초기화
      </Button>
    </div>
  )
}

export const Default: Story = {
  name: "기본",
  render: (args) => <SelectionExample {...args} />,
}

export const Empty: Story = {
  name: "결과 없음",
  args: { items: [], emptyMessage: "일치하는 결과가 없습니다. 다른 검색어를 입력해 주세요." },
}

export const Disabled: Story = { name: "비활성", args: { disabled: true } }

export const BottomList: Story = {
  name: "화면 하단 · 긴 목록",
  render: (args) => (
    <div className="fixed inset-x-4 bottom-24">
      <Autocomplete
        {...args}
        items={Array.from({ length: 20 }, (_, index) => ({
          value: `${index}`,
          label: `예시 항목 ${index + 1}`,
        }))}
      />
    </div>
  ),
}

export const BottomEmpty: Story = {
  name: "화면 하단 · 긴 빈 결과 안내",
  args: {
    items: [],
    emptyMessage:
      "일치하는 결과가 없습니다. 검색어에 오타가 있는지 확인하고 다른 검색어로 다시 시도해 주세요. ".repeat(
        12,
      ),
  },
  render: (args) => (
    <div className="fixed inset-x-4 bottom-24">
      <Autocomplete {...args} />
    </div>
  ),
}
