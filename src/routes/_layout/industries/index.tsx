import { createFileRoute } from "@tanstack/react-router"

import { getReadTrendsSuspenseQueryOptions } from "@/api/generated/api"

import { industriesSearchSchema } from "./-schema"
import { IndustriesPage } from "./page"

export const Route = createFileRoute("/_layout/industries/")({
  validateSearch: industriesSearchSchema,
  loaderDeps: ({ search: { market, filter } }) => ({ market, filter }),
  loader: ({ context: { queryClient }, deps: { market, filter } }) => {
    queryClient.prefetchQuery(
      getReadTrendsSuspenseQueryOptions({ country: market === "domestic" ? "KR" : "US", filter }),
    )
  },
  component: IndustriesPage,
})
