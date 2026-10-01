import type { QueryClient } from "@tanstack/react-query"
import { Link, Outlet, createRootRouteWithContext, useRouterState } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { createContext, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/Header"
import { Input } from "@/components/ui/input"

import { globalUrlStateRouteOptions } from "../hooks/useGlobalUrlState"

interface RouterContext {
  queryClient: QueryClient
}

export const HeaderSearchContext = createContext({ query: "", setQuery: (_query: string) => {} })

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [query, setQuery] = useState("")
  const search = useMemo(() => ({ query, setQuery }), [query])

  return (
    <HeaderSearchContext.Provider value={search}>
      <div className="min-h-screen min-w-0 bg-background text-foreground">
        <Header.Root className="mx-auto w-full max-w-7xl min-w-0 px-4 md:px-6 lg:px-4">
          <Header.Row>
            <Header.Left>
              <Link to="/" className="typo-wordmark text-primary" aria-label="ploutos 시장 요약">
                ploutos.
              </Link>
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
                <Link
                  to="/"
                  aria-current={pathname === "/" ? "page" : undefined}
                  className={
                    pathname === "/"
                      ? "block border-b-2 border-primary px-3 py-2.5 text-primary"
                      : "block px-3 py-2.5 hover:text-primary"
                  }
                >
                  시장 요약
                </Link>
              </li>
              <li>
                <Link
                  to="/industries"
                  aria-current={pathname === "/industries" ? "page" : undefined}
                  className={
                    pathname === "/industries"
                      ? "block border-b-2 border-primary px-3 py-2.5 text-primary"
                      : "block px-3 py-2.5 hover:text-primary"
                  }
                >
                  산업별 동향
                </Link>
              </li>
              <li>
                <Link
                  to="/movers"
                  aria-current={pathname === "/movers" ? "page" : undefined}
                  className={
                    pathname === "/movers"
                      ? "block border-b-2 border-primary px-3 py-2.5 text-primary"
                      : "block px-3 py-2.5 hover:text-primary"
                  }
                >
                  주요 변동 종목
                </Link>
              </li>
              <li>
                <Link
                  to="/stocks/$code"
                  params={{ code: "005380" }}
                  aria-current={pathname.startsWith("/stocks/") ? "page" : undefined}
                  className={
                    pathname.startsWith("/stocks/")
                      ? "block border-b-2 border-primary px-3 py-2.5 text-primary"
                      : "block px-3 py-2.5 hover:text-primary"
                  }
                >
                  종목 상세
                </Link>
              </li>
            </ul>
          </Header.Navigation>
        </Header.Root>
        <div className="mx-auto w-full max-w-7xl min-w-0 px-4 md:px-6 lg:px-4">
          <Outlet />
        </div>
      </div>
    </HeaderSearchContext.Provider>
  )
}

function NotFoundPage() {
  return (
    <main className="flex min-h-[60svh] flex-col items-center justify-center py-16 text-center">
      <h1 className="flex flex-col gap-4 typo-section-heading text-balance sm:typo-page-title">
        <span className="typo-numeric-lg text-primary">404</span>
        페이지를 찾을 수 없어요
      </h1>
      <p className="mt-4 max-w-sm typo-body text-pretty text-muted-foreground">
        입력한 주소를 확인하거나 첫 화면에서 다시 시작해 주세요.
      </p>
      <Button asChild className="mt-8 min-h-11 px-6">
        <Link to="/">첫 화면으로 돌아가기</Link>
      </Button>
    </main>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  ...globalUrlStateRouteOptions,
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})
