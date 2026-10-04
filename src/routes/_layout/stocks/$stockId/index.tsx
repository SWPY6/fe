import { createFileRoute, notFound } from "@tanstack/react-router"

import {
  getChartSuspenseQueryOptions,
  getDisclosuresQueryOptions,
  getNewsQueryOptions,
  getQuoteSuspenseQueryOptions,
  getSummarySuspenseQueryOptions,
} from "@/api/generated/api"

import { stockSearchSchema } from "./-schema"
import { StockPage } from "./page"

export const Route = createFileRoute("/_layout/stocks/$stockId/")({
  validateSearch: stockSearchSchema,
  loaderDeps: ({ search: { from, to, interval } }) => ({ from, to, interval }),
  beforeLoad: ({ params: { stockId } }) => {
    if (!/^[1-9]\d*$/.test(stockId) || !Number.isSafeInteger(Number(stockId))) throw notFound()
  },
  loader: ({ context: { queryClient }, params: { stockId }, deps }) => {
    queryClient.prefetchQuery(getSummarySuspenseQueryOptions(Number(stockId)))
    queryClient.prefetchQuery(getQuoteSuspenseQueryOptions(Number(stockId)))
    queryClient.prefetchQuery(getChartSuspenseQueryOptions(Number(stockId), deps))
    queryClient.prefetchQuery(getNewsQueryOptions(Number(stockId)))
    queryClient.prefetchQuery(getDisclosuresQueryOptions(Number(stockId)))
  },
  component: StockPage,
  notFoundComponent: () => "종목을 찾을 수 없습니다",
})
