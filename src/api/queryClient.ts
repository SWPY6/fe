import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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
      const message = getErrorPolicy(error)?.message
      if (!message) return
      toast.error(query.meta?.errorToastMessage ?? message, {
        id: query.queryHash,
      })
    },
  }),
  mutationCache: new MutationCache({
    onError(error, _variables, _context, mutation) {
      const message = getErrorPolicy(error)?.message
      if (!message) return
      toast.error(mutation.meta?.errorToastMessage ?? message, {
        id: `mutation-${mutation.mutationId}`,
      })
    },
  }),
  defaultOptions: {
    queries: {
      networkMode: "online",
      retry: (failureCount, error) => failureCount < (getErrorPolicy(error)?.retries ?? 0),
    },
    mutations: { retry: false, networkMode: "online", throwOnError: false },
  },
})
