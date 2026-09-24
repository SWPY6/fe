import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { useArgs } from "storybook/preview-api"
import { fn } from "storybook/test"
import { Tabs } from "./Tabs"
const meta = {
  title: "UI/Tabs",
  component: Tabs,
  args: {
    label: "예시 선택",
    children: "선택한 항목의 내용",
    value: "first",
    options: [
      { value: "first", label: "첫 항목" },
      { value: "second", label: "두 번째 항목" },
    ],
    onChange: fn(),
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <Tabs
        {...args}
        onChange={(value) => {
          args.onChange(value)
          updateArgs({ value })
        }}
      >
        {args.value === "first" ? "첫 항목의 내용" : "두 번째 항목의 내용"}
      </Tabs>
    )
  },
} satisfies Meta<typeof Tabs>
export default meta
type Story = StoryObj<typeof meta>
export const KeyboardSelection: Story = {}
