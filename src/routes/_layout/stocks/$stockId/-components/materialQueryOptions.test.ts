import { QueryClient, QueryObserver, focusManager, onlineManager } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { afterEach, expect, test } from "vitest"

import type { DisclosuresSuspenseQueryResult, NewsSuspenseQueryResult } from "@/api/generated/api"
import { api } from "@/api/http/client"
import { ApiError } from "@/api/http/error"
import type { ErrorResponse } from "@/api/http/response"

import {
  getDisclosuresMaterialQueryOptions,
  getNewsMaterialQueryOptions,
} from "./materialQueryOptions"

const originalAdapter = api.defaults.adapter

afterEach(() => {
  api.defaults.adapter = originalAdapter
})

function prepareResponses(code: "P009" | "P011") {
  let next: "success" | "quota" | "network" | "other" = "success"
  let requestCount = 0

  api.defaults.adapter = async (config) => {
    requestCount += 1
    if (next === "network") {
      throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config)
    }
    if (next === "quota" || next === "other") {
      const response = {
        data: {
          error: {
            name: "RequestFailed",
            code: next === "quota" ? code : "P999",
            message: "조회할 수 없습니다.",
          },
        },
        status: 503,
        statusText: "Service Unavailable",
        headers: {},
        config,
      }
      throw new AxiosError(
        "Request failed",
        AxiosError.ERR_BAD_RESPONSE,
        config,
        undefined,
        response,
      )
    }
    return {
      data: { data: { total: 0, items: [] } },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }
  }

  return {
    setResponse(mode: typeof next) {
      next = mode
    },
    getRequestCount() {
      return requestCount
    },
  }
}

test("뉴스가 정상으로 보인 뒤 503/P009가 나면 자동 요청을 막는다", async () => {
  const { setResponse } = prepareResponses("P009")
  const client = new QueryClient()
  const options = getNewsMaterialQueryOptions(7)
  const query = client.getQueryCache().build<NewsSuspenseQueryResult, ErrorResponse>(client, {
    queryKey: ["news", 7],
    queryFn: options.queryFn,
    retry: false,
  })

  await query.fetch()
  expect(query.state.data).toBeDefined()
  for (const setting of [options.refetchOnWindowFocus, options.refetchOnReconnect]) {
    if (typeof setting !== "function") throw new Error("자동 요청 조건이 없습니다.")
    expect(setting(query)).toBe(true)
  }

  setResponse("quota")
  await expect(query.fetch()).rejects.toBeInstanceOf(ApiError)
  expect(query.state.data).toBeDefined()

  for (const setting of [options.refetchOnWindowFocus, options.refetchOnReconnect]) {
    if (typeof setting !== "function") throw new Error("자동 요청 조건이 없습니다.")
    expect(setting(query)).toBe(false)
  }

  setResponse("network")
  await expect(query.fetch()).rejects.toBeInstanceOf(ApiError)
  for (const setting of [options.refetchOnWindowFocus, options.refetchOnReconnect]) {
    if (typeof setting !== "function") throw new Error("자동 요청 조건이 없습니다.")
    expect(setting(query)).toBe(true)
  }

  setResponse("other")
  await expect(query.fetch()).rejects.toBeInstanceOf(ApiError)
  for (const setting of [options.refetchOnWindowFocus, options.refetchOnReconnect]) {
    if (typeof setting !== "function") throw new Error("자동 요청 조건이 없습니다.")
    expect(setting(query)).toBe(true)
  }
})

test("공시가 정상으로 보인 뒤 503/P011이 나면 자동 요청을 막는다", async () => {
  const { setResponse } = prepareResponses("P011")
  const client = new QueryClient()
  const options = getDisclosuresMaterialQueryOptions(7)
  const query = client
    .getQueryCache()
    .build<DisclosuresSuspenseQueryResult, ErrorResponse>(client, {
      queryKey: ["disclosures", 7],
      queryFn: options.queryFn,
      retry: false,
    })

  await query.fetch()
  expect(query.state.data).toBeDefined()
  for (const setting of [options.refetchOnWindowFocus, options.refetchOnReconnect]) {
    if (typeof setting !== "function") throw new Error("자동 요청 조건이 없습니다.")
    expect(setting(query)).toBe(true)
  }

  setResponse("quota")
  await expect(query.fetch()).rejects.toBeInstanceOf(ApiError)
  expect(query.state.data).toBeDefined()

  for (const setting of [options.refetchOnWindowFocus, options.refetchOnReconnect]) {
    if (typeof setting !== "function") throw new Error("자동 요청 조건이 없습니다.")
    expect(setting(query)).toBe(false)
  }

  setResponse("network")
  await expect(query.fetch()).rejects.toBeInstanceOf(ApiError)
  for (const setting of [options.refetchOnWindowFocus, options.refetchOnReconnect]) {
    if (typeof setting !== "function") throw new Error("자동 요청 조건이 없습니다.")
    expect(setting(query)).toBe(true)
  }

  setResponse("other")
  await expect(query.fetch()).rejects.toBeInstanceOf(ApiError)
  for (const setting of [options.refetchOnWindowFocus, options.refetchOnReconnect]) {
    if (typeof setting !== "function") throw new Error("자동 요청 조건이 없습니다.")
    expect(setting(query)).toBe(true)
  }
})

test("뉴스 503 뒤에는 탭 복귀·재연결로 요청하지 않고 인터넷 오류 뒤에는 다시 요청한다", async () => {
  const { setResponse, getRequestCount } = prepareResponses("P009")
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, networkMode: "always", refetchOnReconnect: true } },
  })
  const options = getNewsMaterialQueryOptions(7)
  const observer = new QueryObserver<NewsSuspenseQueryResult, ErrorResponse>(client, {
    queryKey: ["news", 7],
    queryFn: options.queryFn,
    refetchOnWindowFocus: options.refetchOnWindowFocus,
    refetchOnReconnect: options.refetchOnReconnect,
    retry: false,
    networkMode: "always",
  })

  client.mount()
  const unsubscribe = observer.subscribe(() => {})
  try {
    await expect.poll(() => observer.getCurrentResult().isSuccess).toBe(true)
    expect(getRequestCount()).toBe(1)

    setResponse("quota")
    await observer.refetch()
    await expect.poll(() => observer.getCurrentResult().isRefetchError).toBe(true)
    expect(getRequestCount()).toBe(2)

    focusManager.setFocused(false)
    focusManager.setFocused(true)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(getRequestCount()).toBe(2)

    onlineManager.setOnline(false)
    onlineManager.setOnline(true)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(getRequestCount()).toBe(2)

    setResponse("network")
    await observer.refetch()
    expect(getRequestCount()).toBe(3)

    setResponse("success")
    onlineManager.setOnline(false)
    onlineManager.setOnline(true)
    await expect.poll(getRequestCount).toBe(4)
  } finally {
    unsubscribe()
    client.unmount()
    client.clear()
    focusManager.setFocused(undefined)
    onlineManager.setOnline(true)
  }
})

test("공시 503 뒤에는 탭 복귀·재연결로 요청하지 않고 인터넷 오류 뒤에는 다시 요청한다", async () => {
  const { setResponse, getRequestCount } = prepareResponses("P011")
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, networkMode: "always", refetchOnReconnect: true } },
  })
  const options = getDisclosuresMaterialQueryOptions(7)
  const observer = new QueryObserver<DisclosuresSuspenseQueryResult, ErrorResponse>(client, {
    queryKey: ["disclosures", 7],
    queryFn: options.queryFn,
    refetchOnWindowFocus: options.refetchOnWindowFocus,
    refetchOnReconnect: options.refetchOnReconnect,
    retry: false,
    networkMode: "always",
  })

  client.mount()
  const unsubscribe = observer.subscribe(() => {})
  try {
    await expect.poll(() => observer.getCurrentResult().isSuccess).toBe(true)
    expect(getRequestCount()).toBe(1)

    setResponse("quota")
    await observer.refetch()
    await expect.poll(() => observer.getCurrentResult().isRefetchError).toBe(true)
    expect(getRequestCount()).toBe(2)

    focusManager.setFocused(false)
    focusManager.setFocused(true)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(getRequestCount()).toBe(2)

    onlineManager.setOnline(false)
    onlineManager.setOnline(true)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(getRequestCount()).toBe(2)

    setResponse("network")
    await observer.refetch()
    expect(getRequestCount()).toBe(3)

    setResponse("success")
    onlineManager.setOnline(false)
    onlineManager.setOnline(true)
    await expect.poll(getRequestCount).toBe(4)
  } finally {
    unsubscribe()
    client.unmount()
    client.clear()
    focusManager.setFocused(undefined)
    onlineManager.setOnline(true)
  }
})
