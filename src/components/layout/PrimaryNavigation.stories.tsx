import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { useArgs } from "storybook/preview-api"
import { fn } from "storybook/test"
import { PrimaryNavigation, type NavigationSection } from "./PrimaryNavigation"

const meta = {
  title: "Layout/PrimaryNavigation",
  component: PrimaryNavigation,
  args: { value: "summary", onChange: fn() },
  argTypes: {
    value: { control: "select", options: ["summary", "industries", "movers", "detail"] },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs<{ value: NavigationSection }>()
    return (
      <PrimaryNavigation
        {...args}
        onChange={(value) => {
          args.onChange(value)
          updateArgs({ value })
        }}
      />
    )
  },
} satisfies Meta<typeof PrimaryNavigation>
export default meta
type Story = StoryObj<typeof meta>
export const Summary: Story = {}
export const Industries: Story = { args: { value: "industries" } }
export const Movers: Story = { args: { value: "movers" } }
export const Detail: Story = { args: { value: "detail" } }
export const Keyboard: Story = {
  decorators: [
    (Story) => (
      <div className="space-y-4">
        <p className="text-sm">
          Tab으로 이동하고 Enter 또는 Space로 선택합니다. 선택은 화면 예시이며 경로를 이동하지
          않습니다.
        </p>
        <Story />
      </div>
    ),
  ],
}
