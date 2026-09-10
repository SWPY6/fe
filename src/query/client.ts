import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ApiError } from "../api/error"
import { getErrorPolicy } from "./error"

interface ErrorMeta extends Record<string, unknown> {
  errorPresentation?: "local"
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
      const { message } = getErrorPolicy(error)
      if (!message || query.meta?.errorPresentation === "local") return
      if (query.state.data !== undefined) {
        toast.error(message, { id: query.queryHash })
      }
    },
  }),
  mutationCache: new MutationCache({
    onError(error, _variables, _context, mutation) {
      const { message } = getErrorPolicy(error)
      if (!message || mutation.meta?.errorPresentation === "local") return
      const isNetworkOrTimeoutError =
        error instanceof ApiError && (error.kind === "network" || error.kind === "timeout")
      toast.error(
        isNetworkOrTimeoutError
          ? "서버 응답을 받지 못했습니다. 네트워크 연결 상태를 확인해 주세요."
          : message,
        { id: `mutation-${mutation.mutationId}` },
      )
    },
  }),
  defaultOptions: {
    queries: {
      networkMode: "online",
      retry: (failureCount, error) => failureCount < getErrorPolicy(error).retries,
      throwOnError: (error, query) =>
        getErrorPolicy(error).message !== null &&
        query.meta?.errorPresentation !== "local" &&
        query.state.data === undefined,
    },
    mutations: { retry: false, networkMode: "online", throwOnError: false },
  },
})
