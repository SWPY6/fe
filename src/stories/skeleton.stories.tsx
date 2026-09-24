import type { Meta, StoryObj } from "@storybook/react-vite"

import { Skeleton } from "../components/ui/skeleton"

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const CardLoading: Story = {
  name: "카드 로딩",
  render: () => (
    <div className="w-80 space-y-5 rounded-xl bg-card p-6 shadow-surface">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-20" />
    </div>
  ),
}

export const ListLoading: Story = {
  name: "목록 로딩",
  render: () => (
    <div className="w-80 space-y-4">
      {[1, 2, 3].map((row) => (
        <div key={row} className="flex items-center justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  ),
}
