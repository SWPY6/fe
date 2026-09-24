import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { Header } from "./Header"

const meta = {
  title: "Layout/Header",
  component: Header,
  render: (args) => <Header key={args.initialQuery} {...args} />,
  args: { initialQuery: "" },
} satisfies Meta<typeof Header>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const SearchInput: Story = { args: { initialQuery: "예시전자 DEMO01" } }
export const DemoActions: Story = {
  parameters: {
    docs: {
      description: {
        story: "알림·로그인·회원가입 버튼을 누르면 실제 작업 없이 안내 문구가 표시됩니다.",
      },
    },
  },
}
export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}
