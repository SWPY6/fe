import { createFileRoute } from "@tanstack/react-router"

import {
  getReadFlowsSuspenseQueryOptions,
  getReadNewsSuspenseQueryOptions,
  getSummary1SuspenseQueryOptions,
} from "@/api/generated/api"

import { RootPage } from "./page"

export const Route = createFileRoute("/_layout/(root)/")({
  loaderDeps: ({ search: { market } }) => ({ market }),
  loader: ({ context: { queryClient }, deps: { market } }) => {
    queryClient.prefetchQuery(
      getSummary1SuspenseQueryOptions({ region: market === "domestic" ? "DOMESTIC" : "OVERSEAS" }),
    )
    queryClient.prefetchQuery(
      getReadFlowsSuspenseQueryOptions({ country: market === "domestic" ? "KR" : "US" }),
    )
    queryClient.prefetchQuery(
      getReadNewsSuspenseQueryOptions({ country: market === "domestic" ? "KR" : "US" }),
    )
  },
  component: RootPage,
})
