import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Pagination } from "../components/ui/pagination"

function PaginationExample() {
  const [page, setPage] = useState(1)

  return (
    <Pagination.Root>
      <Pagination.Previous disabled={page === 1} onClick={() => setPage(page - 1)} />
      <Pagination.Status>{page} / 5</Pagination.Status>
      <Pagination.Next disabled={page === 5} onClick={() => setPage(page + 1)} />
    </Pagination.Root>
  )
}

const meta = {
  title: "Components/Pagination",
  component: Pagination.Root,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Pagination.Root>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  name: "페이지 이동",
  render: () => <PaginationExample />,
}
