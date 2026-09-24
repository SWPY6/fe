import type { Meta, StoryObj } from "@storybook/react-vite"

import { Table } from "../components/ui/table"

const meta = {
  title: "Components/Table",
  component: Table.Root,
  parameters: { layout: "centered", controls: { disable: true } },
} satisfies Meta<typeof Table.Root>

export default meta
type Story = StoryObj<typeof meta>

export const Stocks: Story = {
  name: "종목 목록",
  render: () => (
    <div className="w-[560px] max-w-[calc(100vw-3rem)]">
      <Table.Root>
        <Table.Caption>예시 종목의 가격과 등락률</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.Head>종목</Table.Head>
            <Table.Head className="text-right">현재가</Table.Head>
            <Table.Head className="text-right">등락률</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>삼성전자</Table.Cell>
            <Table.Cell className="text-right">72,400원</Table.Cell>
            <Table.Cell className="text-right text-positive">+1.25%</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>SK하이닉스</Table.Cell>
            <Table.Cell className="text-right">183,500원</Table.Cell>
            <Table.Cell className="text-right text-negative">-0.82%</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell colSpan={2}>표시 종목</Table.Cell>
            <Table.Cell className="text-right">2개</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table.Root>
    </div>
  ),
}
