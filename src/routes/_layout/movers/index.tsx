import { createFileRoute } from "@tanstack/react-router"

import {
  getReadFlowsSuspenseQueryOptions,
  getReadStocksSuspenseQueryOptions,
} from "@/api/generated/api"

import { moversSearchSchema } from "./-schema"
import { MoversPage } from "./page"

export const Route = createFileRoute("/_layout/movers/")({
  validateSearch: moversSearchSchema,
  loaderDeps: ({ search: { market, q, industry, sort, page, includeCaution } }) => ({
    market,
    q,
    industry,
    sort,
    page,
    includeCaution,
  }),
  loader: ({
    context: { queryClient },
    deps: { market, q, industry, sort, page, includeCaution },
  }) => {
    queryClient.prefetchQuery(
      getReadFlowsSuspenseQueryOptions({ country: market === "domestic" ? "KR" : "US" }),
    )
    queryClient.prefetchQuery(
      getReadStocksSuspenseQueryOptions({
        country: market === "domestic" ? "KR" : "US",
        q,
        industry,
        sort,
        page,
        size: 20,
        includeCaution,
      }),
    )
  },
  component: MoversPage,
})
