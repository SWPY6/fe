import type { Meta, StoryObj } from "@storybook/tanstack-react"
import { PageHeading } from "./PageHeading"
const meta = {
  title: "Layout/PageHeading",
  component: PageHeading,
  args: {
    title: "시장 요약",
    path: ["PLOUTOS", "대시보드", "시장 요약"],
    description: "국내외 시장 흐름을 예시 데이터로 확인합니다.",
  },
} satisfies Meta<typeof PageHeading>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const LongHeading: Story = {
  args: {
    title: "국내외 시장과 산업별 흐름을 비교하는 대시보드 화면의 긴 제목 예시",
    path: ["PLOUTOS", "시장 데이터", "국내 산업별 동향"],
  },
}
