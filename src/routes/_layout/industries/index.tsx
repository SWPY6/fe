import { createFileRoute } from "@tanstack/react-router"

import { getReadTrendsSuspenseQueryOptions } from "@/api/generated/api"

import { industriesSearchSchema } from "./-schema"
import { IndustriesPage } from "./page"

export const Route = createFileRoute("/_layout/industries/")({
  validateSearch: industriesSearchSchema,
  loaderDeps: ({ search: { market, filter } }) => ({ market, filter }),
  loader: ({ cause, context: { queryClient }, deps: { market, filter } }) => {
    const prefetch = queryClient.prefetchQuery(
      getReadTrendsSuspenseQueryOptions({ country: market === "domestic" ? "KR" : "US", filter }),
    )
    // Keep the current page until its next URL state can render without collapsing.
    if (cause === "stay") return prefetch
  },
  component: IndustriesPage,
})
