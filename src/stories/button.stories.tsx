import type { Meta, StoryObj } from "@storybook/react-vite"
import { Search } from "lucide-react"

import { Button } from "../components/ui/button"

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  name: "종류",
  render: () => (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
      {(
        [
          { label: "기본", variant: "default" },
          { label: "보조", variant: "secondary" },
          { label: "테두리", variant: "outline" },
          { label: "배경 없음", variant: "ghost" },
          { label: "텍스트", variant: "link" },
          { label: "위험 작업", variant: "destructive" },
        ] as const
      ).map(({ label, variant }) => (
        <div key={variant} className="flex flex-col items-start gap-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Button variant={variant}>확인</Button>
        </div>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  name: "크기",
  render: () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">텍스트 버튼</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">XS</Button>
          <Button size="sm">Small</Button>
          <Button>기본</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">아이콘 버튼</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="icon-xs" aria-label="검색, XS">
            <Search />
          </Button>
          <Button size="icon-sm" aria-label="검색, Small">
            <Search />
          </Button>
          <Button size="icon" aria-label="검색, 기본">
            <Search />
          </Button>
          <Button size="icon-lg" aria-label="검색, Large">
            <Search />
          </Button>
        </div>
      </div>
    </div>
  ),
}

export const States: Story = {
  name: "상태",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex flex-col items-start gap-2">
        <span className="text-sm text-muted-foreground">사용 가능</span>
        <Button>확인</Button>
      </div>
      <div className="flex flex-col items-start gap-2">
        <span className="text-sm text-muted-foreground">비활성</span>
        <Button disabled>확인</Button>
      </div>
    </div>
  ),
}
