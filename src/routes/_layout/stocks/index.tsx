/* oxlint-disable route-page/convention -- 종목 선택 화면으로 이동하는 진입 라우트 */
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/stocks/")({
  beforeLoad: () => {
    throw redirect({
      to: "/movers",
      search: (previous) => ({ market: previous.market, sort: "ALL" }),
      replace: true,
    })
  },
})
