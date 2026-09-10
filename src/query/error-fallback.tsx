import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import type { ErrorComponentProps } from "@tanstack/react-router"

import { getErrorPolicy } from "./error"

export function QueryErrorFallback({ error, reset }: ErrorComponentProps) {
  const { reset: resetQuery } = useQueryErrorResetBoundary()

  return (
    <section role="alert" className="space-y-4 p-6">
      <h1 className="text-lg font-semibold">정보를 불러오지 못했습니다.</h1>
      <p>{getErrorPolicy(error).message}</p>
      <button
        type="button"
        className="rounded-sm border px-4 py-2"
        onClick={() => {
          resetQuery()
          reset()
        }}
      >
        다시 시도
      </button>
    </section>
  )
}
