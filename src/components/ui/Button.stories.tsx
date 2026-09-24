import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { Button } from "./Button"
const meta = { title: "UI/Button", component: Button, args: { children: "선택" } } satisfies Meta<
  typeof Button
>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
export const Selected: Story = { args: { "aria-pressed": true } }
