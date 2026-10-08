import {
  getDisclosuresSuspenseQueryOptions,
  getNewsSuspenseQueryOptions,
} from "@/api/generated/api"
import { ApiError } from "@/api/http/error"

function canAutoRefetch(query: { state: { error: unknown } }, code: "P009" | "P011") {
  const error = query.state.error
  return !(
    error instanceof ApiError &&
    error.kind === "http" &&
    error.status === 503 &&
    error.data.error.code === code
  )
}

export const getNewsMaterialQueryOptions = (stockId: number) =>
  getNewsSuspenseQueryOptions(stockId, undefined, {
    query: {
      refetchOnWindowFocus: (query) => canAutoRefetch(query, "P009"),
      refetchOnReconnect: (query) => canAutoRefetch(query, "P009"),
    },
  })

export const getDisclosuresMaterialQueryOptions = (stockId: number) =>
  getDisclosuresSuspenseQueryOptions(stockId, undefined, {
    query: {
      refetchOnWindowFocus: (query) => canAutoRefetch(query, "P011"),
      refetchOnReconnect: (query) => canAutoRefetch(query, "P011"),
    },
  })
