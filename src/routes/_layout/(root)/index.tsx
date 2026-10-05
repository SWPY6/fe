import { createFileRoute } from "@tanstack/react-router"

import {
  getReadFlowsSuspenseQueryOptions,
  getReadNewsSuspenseQueryOptions,
} from "@/api/generated/api"

import { getMarketSummaryQueryOptions } from "./-query/market-summary"
import { RootPage } from "./page"

export const Route = createFileRoute("/_layout/(root)/")({
  loaderDeps: ({ search: { market } }) => ({ market }),
  loader: ({ cause, context: { queryClient }, deps: { market } }) => {
    const prefetch = Promise.all([
      queryClient.prefetchQuery(
        getMarketSummaryQueryOptions({ region: market === "domestic" ? "DOMESTIC" : "OVERSEAS" }),
      ),
      queryClient.prefetchQuery(
        getReadFlowsSuspenseQueryOptions({ country: market === "domestic" ? "KR" : "US" }),
      ),
      queryClient.prefetchQuery(
        getReadNewsSuspenseQueryOptions({ country: market === "domestic" ? "KR" : "US" }),
      ),
    ])
    // Keep the current page until its next URL state can render without collapsing.
    if (cause === "stay") return prefetch
  },
  component: RootPage,
})
