import { onlineManager, QueryObserver } from "@tanstack/react-query"
import { AxiosError } from "axios"
import type { AxiosAdapter, GenericAbortSignal } from "axios"
import { toast } from "sonner"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { api } from "../api/client"
import { ApiError } from "../api/error"
import { queryClient } from "./client"

vi.mock("sonner", () => ({ toast: { error: vi.fn<typeof toast.error>() } }))

beforeEach(() => {
  vi.useFakeTimers()
  onlineManager.setOnline(true)
  queryClient.mount()
})

afterEach(() => {
  queryClient.clear()
  queryClient.unmount()
  onlineManager.setOnline(true)
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe("query error policy", () => {
  it.each([
    ["network", undefined, 3],
    ["timeout", undefined, 2],
    ["http", 408, 2],
    ["http", 500, 2],
    ["http", 502, 2],
    ["http", 503, 2],
    ["http", 504, 2],
    ["http", 401, 1],
    ["http", 403, 1],
    ["http", 404, 1],
    ["http", 422, 1],
    ["http", 429, 1],
    ["http", 501, 1],
    ["canceled", undefined, 1],
    ["unknown", undefined, 1],
  ] as const)("limits %s/%s to %i attempts", async (kind, status, attempts) => {
    const error = new ApiError("Private diagnostic message", { kind, status })
    const queryFn = vi.fn<() => Promise<never>>().mockRejectedValue(error)
    const result = queryClient
      .fetchQuery({ queryKey: [kind, status], queryFn })
      .catch((e: unknown) => e)

    await vi.runAllTimersAsync()

    expect(await result).toBe(error)
    expect(queryFn).toHaveBeenCalledTimes(attempts)
    expect(toast.error).not.toHaveBeenCalled()
  })

  it("retains cached data and notifies once only after all network retries fail", async () => {
    queryClient.setQueryData(["users"], ["cached user"])
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config)
    })
    const observer = new QueryObserver(queryClient, {
      queryKey: ["users"],
      queryFn: () => api.get("/users", { adapter }),
    })
    const unsubscribe = observer.subscribe(() => {})
    const secondObserver = new QueryObserver(queryClient, observer.options)
    const unsubscribeSecond = secondObserver.subscribe(() => {})

    await vi.advanceTimersByTimeAsync(0)
    expect(observer.getCurrentResult().failureReason).toBeInstanceOf(ApiError)
    expect(observer.getCurrentResult().error).toBeNull()
    expect(toast.error).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1000)
    expect(adapter).toHaveBeenCalledTimes(2)
    expect(toast.error).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(2000)

    expect(adapter).toHaveBeenCalledTimes(3)
    expect(observer.getCurrentResult().data).toEqual(["cached user"])
    expect(observer.getCurrentResult().error).toMatchObject({ kind: "network" })
    expect(toast.error).toHaveBeenCalledTimes(1)
    unsubscribe()
    unsubscribeSecond()
  })

  it("does not notify when a retry recovers", async () => {
    queryClient.setQueryData(["recover"], "old")
    const queryFn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new ApiError("timeout", { kind: "timeout" }))
      .mockResolvedValue("new")
    const result = queryClient.fetchQuery({ queryKey: ["recover"], queryFn })
    await vi.runAllTimersAsync()
    expect(await result).toBe("new")
    expect(toast.error).not.toHaveBeenCalled()
  })

  it("pauses offline and starts when connectivity returns", async () => {
    onlineManager.setOnline(false)
    const queryFn = vi.fn<() => Promise<string>>().mockResolvedValue("online result")
    const result = queryClient.fetchQuery({ queryKey: ["offline"], queryFn })
    expect(queryClient.getQueryState(["offline"])?.fetchStatus).toBe("paused")
    expect(queryFn).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
    onlineManager.setOnline(true)
    expect(await result).toBe("online result")
  })

  it("reverts a Query-driven Axios cancellation without retries or notifications", async () => {
    queryClient.setQueryData(["cancel"], "cached")
    let requestSignal: GenericAbortSignal | undefined
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      requestSignal = config.signal
      await new Promise<void>((resolve) =>
        config.signal?.addEventListener?.("abort", () => resolve()),
      )
      return { data: "late", status: 200, statusText: "OK", headers: {}, config }
    })
    const result = queryClient
      .fetchQuery({
        queryKey: ["cancel"],
        queryFn: ({ signal }) => api.get("/cancel", { signal, adapter }),
      })
      .catch(() => undefined)
    await vi.advanceTimersByTimeAsync(0)
    await queryClient.cancelQueries({ queryKey: ["cancel"] })
    await result
    expect(requestSignal?.aborted).toBe(true)
    expect(queryClient.getQueryData(["cancel"])).toBe("cached")
    expect(queryClient.getQueryState(["cancel"])?.error).toBeNull()
    expect(adapter).toHaveBeenCalledTimes(1)
    expect(toast.error).not.toHaveBeenCalled()
  })

  it("leaves local presentation to the feature", async () => {
    queryClient.setQueryData(["local"], "cached")
    await queryClient
      .fetchQuery({
        queryKey: ["local"],
        meta: { errorPresentation: "local" },
        queryFn: async () => {
          throw new ApiError("invalid input", { kind: "http", status: 422 })
        },
      })
      .catch(() => undefined)
    expect(toast.error).not.toHaveBeenCalled()
  })
})

describe("mutation error policy", () => {
  it.each(["network", "timeout"] as const)("does not replay a %s failure", async (kind) => {
    const mutationFn = vi
      .fn<() => Promise<never>>()
      .mockRejectedValue(new ApiError("private", { kind }))
    const mutation = queryClient.getMutationCache().build(queryClient, { mutationFn })
    await mutation.execute(undefined).catch(() => undefined)
    expect(mutationFn).toHaveBeenCalledTimes(1)
    expect(toast.error).toHaveBeenCalledExactlyOnceWith(
      "서버 응답을 받지 못했습니다. 네트워크 연결 상태를 확인해 주세요.",
      expect.any(Object),
    )
  })

  it.each([
    { kind: "canceled" as const, meta: undefined },
    { kind: "http" as const, meta: { errorPresentation: "local" as const } },
  ])("does not duplicate local UI or notify cancellation", async ({ kind, meta }) => {
    const mutation = queryClient.getMutationCache().build(queryClient, {
      meta,
      mutationFn: async () => {
        throw new ApiError("private", { kind, status: 422 })
      },
    })
    await mutation.execute(undefined).catch(() => undefined)
    expect(toast.error).not.toHaveBeenCalled()
  })
})
