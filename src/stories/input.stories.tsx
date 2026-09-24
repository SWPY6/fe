import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input } from "../components/ui/input"

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {
  name: "입력 상태",
  render: () => (
    <div className="grid w-72 gap-5">
      <label htmlFor="stock-search" className="grid gap-2 text-sm">
        종목 검색
        <Input id="stock-search" placeholder="종목명이나 코드를 입력하세요" />
      </label>
      <label htmlFor="stock-value" className="grid gap-2 text-sm">
        입력된 값
        <Input id="stock-value" defaultValue="삼성전자" />
      </label>
      <label htmlFor="stock-disabled" className="grid gap-2 text-sm text-muted-foreground">
        비활성
        <Input id="stock-disabled" disabled placeholder="입력할 수 없습니다" />
      </label>
    </div>
  ),
}

export const Invalid: Story = {
  name: "오류 상태",
  render: () => (
    <label htmlFor="stock-invalid" className="grid w-72 gap-2 text-sm">
      종목 코드
      <Input
        id="stock-invalid"
        aria-invalid="true"
        aria-describedby="input-error"
        defaultValue="잘못된 코드"
      />
      <span id="input-error" className="text-sm text-destructive">
        종목 코드를 확인해 주세요.
      </span>
    </label>
  ),
}
