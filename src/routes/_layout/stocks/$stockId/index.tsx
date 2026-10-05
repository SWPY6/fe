import { createFileRoute } from "@tanstack/react-router"

import {
  getChartSuspenseQueryOptions,
  getQuoteSuspenseQueryOptions,
  getSummarySuspenseQueryOptions,
} from "@/api/generated/api"

import { stockSearchSchema } from "./-schema"
import { StockPage } from "./page"

export const Route = createFileRoute("/_layout/stocks/$stockId/")({
  validateSearch: stockSearchSchema,
  loaderDeps: ({ search: { from, to, interval } }) => ({ from, to, interval }),
  loader: ({ cause, context: { queryClient }, params: { stockId }, deps }) => {
    queryClient.prefetchQuery(getSummarySuspenseQueryOptions(Number(stockId)))
    queryClient.prefetchQuery(getQuoteSuspenseQueryOptions(Number(stockId)))
    const prefetch = queryClient.prefetchQuery(getChartSuspenseQueryOptions(Number(stockId), deps))
    // Keep the current page until its next URL state can render without collapsing.
    if (cause === "stay") return prefetch
  },
  component: StockPage,
})
