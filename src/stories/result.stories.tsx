import type { Meta, StoryObj } from "@storybook/react-vite"

import { Result } from "../components/ui/Result"

const meta = {
  title: "Components/Result",
  component: Result,
  parameters: { layout: "padded" },
  args: {
    title: "시장 지표를 불러오지 못했습니다",
    description: "잠시 후 다시 확인해 주세요.",
  },
} satisfies Meta<typeof Result>

export default meta
type Story = StoryObj<typeof meta>

export const Retry: Story = {
  name: "재시도",
  args: {
    button: <Result.Button>다시 시도</Result.Button>,
  },
}

export const WithoutButton: Story = {
  name: "안내만 표시",
}
