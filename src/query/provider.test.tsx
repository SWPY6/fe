import { useQuery } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { toast } from "sonner"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "../api/error"
import { queryClient } from "./client"
import { QueryErrorFallback } from "./error-fallback"
import { QueryProvider } from "./provider"

vi.mock("sonner", () => ({ toast: { error: vi.fn<typeof toast.error>() }, Toaster: () => null }))

afterEach(() => {
  queryClient.clear()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

function renderQuery(queryFn: () => Promise<string>) {
  function Page() {
    const { data, isPending } = useQuery({ queryKey: ["page"], queryFn, retry: false })
    return <p>{isPending ? "불러오는 중" : data}</p>
  }

  const router = createRouter({
    routeTree: createRootRoute({ component: Page }),
    history: createMemoryHistory({ initialEntries: ["/"] }),
    defaultErrorComponent: QueryErrorFallback,
  })

  render(
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>,
  )
}

describe("query error UI", () => {
  it("shows the route Boundary on initial failure and recovers through its retry button", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const queryFn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new ApiError("Sensitive server detail", { kind: "timeout" }))
      .mockResolvedValue("복구된 데이터")
    renderQuery(queryFn)

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("서버 응답이 지연되고 있습니다.")
    expect(alert).not.toHaveTextContent("Sensitive server detail")
    expect(toast.error).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }))

    expect(await screen.findByText("복구된 데이터")).toBeVisible()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(queryFn).toHaveBeenCalledTimes(2)
  })

  it("keeps the rendered data and shows a toast instead of the Boundary on background failure", async () => {
    queryClient.setQueryData(["page"], "기존 데이터")
    renderQuery(
      vi
        .fn<() => Promise<string>>()
        .mockRejectedValue(new ApiError("Network Error", { kind: "network" })),
    )

    expect(await screen.findByText("기존 데이터")).toBeVisible()
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getByText("기존 데이터")).toBeVisible()
  })

  it("provides a common fallback for unhandled domain errors too", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
    renderQuery(
      vi
        .fn<() => Promise<string>>()
        .mockRejectedValue(new ApiError("private", { kind: "http", status: 401 })),
    )
    expect(await screen.findByRole("alert")).toHaveTextContent("로그인이 필요합니다.")
    expect(toast.error).not.toHaveBeenCalled()
  })
})
