import type { Meta, StoryObj } from "@storybook/react-vite"
import { Search } from "lucide-react"
import { useState } from "react"

import { Header } from "../components/ui/Header"
import { Input } from "../components/ui/input"

const meta = {
  title: "Components/Header",
  component: Header.Root,
  parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta<typeof Header.Root>

export default meta
type Story = StoryObj<typeof meta>

function HeaderExample() {
  const [query, setQuery] = useState("")

  return (
    <Header.Root className="mx-auto w-full max-w-7xl min-w-0 px-4 md:px-6 lg:px-4">
      <Header.Row>
        <Header.Left>
          <a href="#overview" className="typo-wordmark text-primary" aria-label="ploutos 시장 요약">
            ploutos.
          </a>
        </Header.Left>
        <Header.Middle>
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            leadingIcon={<Search aria-hidden="true" />}
            placeholder="종목명 또는 종목코드 검색"
            aria-label="종목명 또는 종목코드 검색"
            variant="filled"
            className="h-10 bg-muted"
          />
        </Header.Middle>
      </Header.Row>
      <Header.Navigation aria-label="주요 메뉴">
        <ul className="flex w-max min-w-full items-center gap-6 typo-label-sm text-muted-foreground md:gap-10">
          <li>
            <a
              href="#overview"
              aria-current="page"
              className="block border-b-2 border-primary px-3 py-2.5 text-primary"
            >
              시장 요약
            </a>
          </li>
          <li>
            <a href="#industries" className="block px-3 py-2.5 hover:text-primary">
              산업별 동향
            </a>
          </li>
          <li>
            <a href="#movers" className="block px-3 py-2.5 hover:text-primary">
              주요 변동 종목
            </a>
          </li>
          <li>
            <a href="#stock" className="block px-3 py-2.5 hover:text-primary">
              종목 상세
            </a>
          </li>
        </ul>
      </Header.Navigation>
    </Header.Root>
  )
}

export const Default: Story = {
  name: "현재 화면 구성",
  render: () => <HeaderExample />,
}

export const WithoutSearchOrNavigation: Story = {
  name: "검색과 메뉴 없이 조합",
  render: () => (
    <Header.Root className="mx-auto w-full max-w-7xl min-w-0 px-4 md:px-6 lg:px-4">
      <Header.Row>
        <Header.Left>
          <span className="typo-wordmark text-primary">브랜드</span>
        </Header.Left>
        <Header.Right>
          <span className="typo-label text-muted-foreground">계정 영역</span>
        </Header.Right>
      </Header.Row>
    </Header.Root>
  ),
}

export const Mobile: Story = {
  name: "모바일 한 줄 배치",
  globals: { viewport: { value: "mobile1", isRotated: false } },
  render: () => <HeaderExample />,
}
