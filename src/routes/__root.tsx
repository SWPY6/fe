import { Link, Outlet, createRootRoute } from "@tanstack/react-router"

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold">페이지를 찾을 수 없습니다.</h1>
      <Link className="mt-6 inline-block text-sky-400 hover:text-sky-300" to="/">
        홈으로 돌아가기
      </Link>
    </main>
  ),
})

function RootLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4" aria-label="주 메뉴">
          <Link className="font-semibold text-white" to="/">
            SWPY6
          </Link>
          <Link className="text-sm text-slate-300 hover:text-white" to="/about">
            소개
          </Link>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
