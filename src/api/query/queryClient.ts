import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ApiError } from "../http/error"
import { getErrorPolicy } from "./errorPolicy"

interface ErrorMeta extends Record<string, unknown> {
  errorToastMessage?: string
}

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: ErrorMeta
    mutationMeta: ErrorMeta
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError(error, query) {
      if (error instanceof ApiError && (error.status ?? 0) >= 500) return
      const message = getErrorPolicy(error)?.message
      if (!message) return
      toast.error(query.meta?.errorToastMessage ?? message, {
        id: query.queryHash,
      })
    },
  }),
  mutationCache: new MutationCache({
    onError(error, _variables, _context, mutation) {
      if (error instanceof ApiError && (error.status ?? 0) >= 500) return
      const message = getErrorPolicy(error)?.message
      if (!message) return
      toast.error(mutation.meta?.errorToastMessage ?? message, {
        id: `mutation-${mutation.mutationId}`,
      })
    },
  }),
  defaultOptions: {
    queries: {
      networkMode: "always",
      refetchOnReconnect: true,
      retry: (failureCount, error) => failureCount < (getErrorPolicy(error)?.retries ?? 0),
      throwOnError: (error, query) =>
        getErrorPolicy(error).message !== null && query.state.data === undefined,
    },
    mutations: { retry: false, networkMode: "always", throwOnError: false },
  },
})
