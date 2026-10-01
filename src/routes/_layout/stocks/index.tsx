/* oxlint-disable route-page/convention -- 화면 없이 기본 종목 상세로 이동하는 진입 라우트 */
import { createFileRoute, redirect } from "@tanstack/react-router"

import { defaultStockCode } from "./$code/-defaults"

export const Route = createFileRoute("/_layout/stocks/")({
  beforeLoad: () => {
    throw redirect({
      to: "/stocks/$code",
      params: { code: defaultStockCode },
      replace: true,
    })
  },
})
