import { ErrorBoundary, Suspense } from "@suspensive/react"
import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render } from "vitest-browser-react"

import { ApiError } from "@/api/http/error"

import { QueryErrorBoundary } from "./QueryErrorBoundary"

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

function QueryResult({ queryFn }: { queryFn: () => Promise<string> }) {
  const { data } = useSuspenseQuery({ queryKey: ["query-error-boundary"], queryFn })
  return <p>{data}</p>
}

afterEach(async () => {
  await cleanup()
  queryClient.clear()
})

test("다시 시도하면 실패한 쿼리를 재요청하고 결과를 표시한다", async () => {
  const queryFn = vi
    .fn<() => Promise<string>>()
    .mockRejectedValueOnce(new ApiError("연결 실패", { kind: "network" }))
    .mockResolvedValue("조회 성공")

  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        <QueryErrorBoundary
          shouldCatch={ApiError}
          fallback={({ error, reset }) => (
            <div>
              <p role="alert">{error.kind}</p>
              <button onClick={reset}>다시 시도</button>
            </div>
          )}
        >
          <Suspense fallback="조회 중">
            <QueryResult queryFn={queryFn} />
          </Suspense>
        </QueryErrorBoundary>
      </QueryErrorResetBoundary>
    </QueryClientProvider>,
  )

  await expect.element(screen.getByRole("alert")).toHaveTextContent("network")
  expect(queryFn).toHaveBeenCalledTimes(1)

  await screen.getByRole("button", { name: "다시 시도" }).click()

  await expect.element(screen.getByText("조회 성공")).toBeVisible()
  expect(queryFn).toHaveBeenCalledTimes(2)
})

test("잡지 않도록 지정한 오류는 상위 에러 경계로 전달한다", async () => {
  const queryFn = vi.fn<() => Promise<string>>().mockRejectedValue(new TypeError("화면 오류"))

  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        <ErrorBoundary fallback={<p role="alert">페이지 오류</p>}>
          <QueryErrorBoundary shouldCatch={ApiError} fallback="영역 오류">
            <Suspense fallback="조회 중">
              <QueryResult queryFn={queryFn} />
            </Suspense>
          </QueryErrorBoundary>
        </ErrorBoundary>
      </QueryErrorResetBoundary>
    </QueryClientProvider>,
  )

  await expect.element(screen.getByRole("alert")).toHaveTextContent("페이지 오류")
  await expect.element(screen.getByText("영역 오류")).not.toBeInTheDocument()
})
