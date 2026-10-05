import { createFileRoute, notFound } from "@tanstack/react-router"

import { getDisclosuresQueryOptions, getNewsQueryOptions } from "@/api/generated/api"

export const Route = createFileRoute("/_layout/stocks/$stockId")({
  beforeLoad: ({ params: { stockId } }) => {
    if (!/^[1-9]\d*$/.test(stockId) || !Number.isSafeInteger(Number(stockId))) throw notFound()
  },
  // 자료 조회는 종목에만 의존하며 차트 검색 조건이 바뀌어도 재실행하지 않는다.
  shouldReload: false,
  loader: ({ context: { queryClient }, params: { stockId } }) => {
    queryClient.prefetchQuery(getNewsQueryOptions(Number(stockId)))
    queryClient.prefetchQuery(getDisclosuresQueryOptions(Number(stockId)))
  },
  notFoundComponent: () => "종목을 찾을 수 없습니다",
})
