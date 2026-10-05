import { createFileRoute } from "@tanstack/react-router"
// TODO: 종목 목록 API 구현 후 아래 import와 loader를 함께 복구한다.
// import {
//   getReadFlowsSuspenseQueryOptions,
//   getReadStocksSuspenseQueryOptions,
// } from "@/api/generated/api"

import { moversSearchSchema } from "./-schema"
import { MoversPage } from "./page"

export const Route = createFileRoute("/_layout/movers/")({
  validateSearch: moversSearchSchema,
  // GET /api/v1/stocks가 서버에 아직 없어 준비 중 화면으로 임시 전환했다.
  // 화면에서 사용하지 않는 목록·산업 필터 요청도 함께 중단한다.
  // loaderDeps: ({ search: { market, q, industry, sort, page, includeCaution } }) => ({
  //   market,
  //   q,
  //   industry,
  //   sort,
  //   page,
  //   includeCaution,
  // }),
  // loader: ({
  //   context: { queryClient },
  //   deps: { market, q, industry, sort, page, includeCaution },
  // }) => {
  //   queryClient.prefetchQuery(
  //     getReadFlowsSuspenseQueryOptions({ country: market === "domestic" ? "KR" : "US" }),
  //   )
  //   queryClient.prefetchQuery(
  //     getReadStocksSuspenseQueryOptions({
  //       country: market === "domestic" ? "KR" : "US",
  //       q,
  //       industry,
  //       sort,
  //       page,
  //       size: 20,
  //       includeCaution,
  //     }),
  //   )
  // },
  component: MoversPage,
})
