import { Link, Outlet, createFileRoute, linkOptions } from "@tanstack/react-router"

import { Header } from "@/components/ui/Header"

const navigation = [
  linkOptions({ to: "/", label: "시장 요약" }),
  linkOptions({ to: "/industries", label: "산업별 동향", preload: "viewport" }),
  linkOptions({ to: "/movers", label: "주요 변동 종목" }),
  linkOptions({ to: "/stocks", label: "종목 상세" }),
]

export const Route = createFileRoute("/_layout")({
  component: Layout,
})

function Layout() {
  return (
    <>
      <Header.Root>
        <Header.Row>
          <Header.Left>
            <Link to="/" className="typo-wordmark text-primary" aria-label="ploutos 시장 요약">
              ploutos.
            </Link>
          </Header.Left>
        </Header.Row>
        <Header.Navigation aria-label="주요 메뉴">
          <ul className="flex w-max min-w-full items-center gap-6 typo-label-sm text-muted-foreground md:gap-10">
            {navigation.map(({ label, ...options }) => (
              <li key={options.to}>
                <Link
                  {...options}
                  activeOptions={{ exact: options.to !== "/stocks", includeSearch: false }}
                  activeProps={{ className: "border-primary text-primary", "aria-current": "page" }}
                  inactiveProps={{ className: "border-transparent hover:text-primary" }}
                  className="block border-b-2 px-3 py-2.5"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </Header.Navigation>
      </Header.Root>
      <Outlet />
      <footer className="pb-8">
        <div className="border-t border-border pt-7">
          <p className="typo-wordmark-sm text-primary">ploutos.</p>
          <p className="mt-2 typo-caption text-muted-foreground">
            제공되는 정보는 투자 판단을 위한 참고 자료이며, 특정 종목의 매수·매도를 권유하지
            않습니다.
          </p>
        </div>
      </footer>
    </>
  )
}
