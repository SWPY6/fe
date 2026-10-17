import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { AxiosError } from "axios"
import type { InternalAxiosRequestConfig } from "axios"
import { afterEach, expect, test } from "vitest"
import { cleanup, render } from "vitest-browser-react"

import { getChart1QueryKey, getSummary1QueryKey } from "@/api/generated/api"
import { api } from "@/api/http/client"
import { globalUrlStateRouteOptions } from "@/hooks/useGlobalUrlState"

import "@/index.css"

import { RootPage } from "./page"

const originalAdapter = api.defaults.adapter
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity } },
})

function respond(config: InternalAxiosRequestConfig) {
  let data: unknown
  switch (config.url) {
    case "/api/v1/industries/flows":
      data = [{ code: "AUTO", displayName: "자동차", rank: 1, stockCount: 5, avgChangeRate: 2 }]
      break
    case "/api/v1/industries/news":
      data = [
        {
          code: "AUTO",
          displayName: "자동차",
          rank: 1,
          news: [{ title: "산업 뉴스", url: "https://example.com/news" }],
        },
      ]
      break
    case "/api/v1/stocks/movers":
      data = { stocks: [{ stockId: 1, name: `${config.params.country} 종목`, price: 1000 }] }
      break
    case "/api/v1/markets/summary":
      data = { indicators: [{ indicator: "KOSPI", name: "코스피", value: 3000, changeRate: 1 }] }
      break
    case "/api/v1/markets/indicators/KOSPI/chart":
      data = {
        candles: [
          { tradeAt: "2026-10-01", close: 2900 },
          { tradeAt: "2026-10-02", close: 3000 },
        ],
      }
      break
    default:
      throw new Error(`예상하지 못한 요청: ${config.url}`)
  }
  return { config, status: 200, statusText: "OK", headers: {}, data: { data } }
}

function reject(config: InternalAxiosRequestConfig, code = "P007", status = 502) {
  return new AxiosError("조회 실패", AxiosError.ERR_BAD_RESPONSE, config, undefined, {
    config,
    status,
    statusText: "Error",
    headers: {},
    data: { error: { name: "TestError", code, message: "조회 실패" } },
  })
}

async function renderHome() {
  const rootRoute = createRootRoute({ ...globalUrlStateRouteOptions, component: Outlet })
  const layoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: "_layout",
    component: Outlet,
  })
  const homeRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: "/",
    component: RootPage,
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={createRouter({
          routeTree: rootRoute.addChildren([layoutRoute.addChildren([homeRoute])]),
          history: createMemoryHistory({ initialEntries: ["/"] }),
        })}
      />
    </QueryClientProvider>,
  )
}

afterEach(async () => {
  await cleanup()
  queryClient.clear()
  api.defaults.adapter = originalAdapter
})

test.each([
  [
    "/api/v1/industries/flows",
    "산업 흐름을 불러오지 못했습니다",
    "P007",
    "시세 정보를 일시적으로 제공할 수 없습니다",
  ],
  [
    "/api/v1/markets/summary",
    "시장 지표를 불러오지 못했습니다",
    "P007",
    "시세 정보를 일시적으로 제공할 수 없습니다",
  ],
  [
    "/api/v1/markets/indicators/KOSPI/chart",
    "차트를 불러오지 못했습니다",
    "P007",
    "시세 정보를 일시적으로 제공할 수 없습니다",
  ],
  [
    "/api/v1/industries/news",
    "산업별 뉴스를 불러오지 못했습니다",
    "P008",
    "뉴스 정보를 일시적으로 불러올 수 없습니다",
  ],
  [
    "/api/v1/industries/news",
    "산업별 뉴스를 불러오지 못했습니다",
    "P009",
    "뉴스 조회가 일시적으로 제한되고 있습니다",
  ],
  [
    "/api/v1/stocks/movers",
    "종목 목록을 불러오지 못했습니다",
    "P007",
    "시세 정보를 일시적으로 제공할 수 없습니다",
  ],
])("%s 실패를 격리하고 해당 영역만 재시도한다 (%s, %s)", async (url, title, code, description) => {
  const requests: string[] = []
  api.defaults.adapter = async (config) => {
    requests.push(config.url!)
    if (config.url === url && requests.filter((path) => path === url).length === 1) {
      throw reject(config, code, code === "P009" ? 503 : 502)
    }
    return respond(config)
  }
  const screen = await renderHome()
  const alert = screen.getByRole("alert")
  await expect.element(alert).toHaveTextContent(title)
  await expect.element(alert).toHaveTextContent(description)
  await expect.element(screen.getByRole("tab", { name: "해외 시장" })).toBeEnabled()
  await expect
    .element(
      screen.getByRole("link", {
        name: url === "/api/v1/industries/news" ? "KR 종목" : "산업 뉴스",
      }),
    )
    .toBeVisible()
  await expect.element(screen.getByRole("heading", { name: "오늘의 산업 흐름" })).toBeVisible()

  await alert.getByRole("button", { name: "다시 시도" }).click()

  await expect.element(alert).not.toBeInTheDocument()
  await expect.element(screen.getByRole("link", { name: "산업 뉴스" })).toBeVisible()
  await expect.element(screen.getByRole("link", { name: "KR 종목" })).toBeVisible()
  await expect.element(screen.getByLabelText("KOSPI 선 그래프")).toBeVisible()
  expect(requests.filter((path) => path === url)).toHaveLength(2)
  for (const path of new Set(requests.filter((endpoint) => endpoint !== url))) {
    expect(requests.filter((request) => request === path)).toHaveLength(1)
  }
})

test("지표와 차트의 갱신 실패는 기존 데이터를 유지하고 다음 갱신에서 회복한다", async () => {
  let failing = false
  api.defaults.adapter = async (config) => {
    if (failing && config.url?.startsWith("/api/v1/markets/")) throw reject(config)
    return respond(config)
  }
  const screen = await renderHome()
  await expect.element(screen.getByLabelText("KOSPI 선 그래프")).toBeVisible()
  failing = true
  await queryClient.invalidateQueries({ queryKey: getSummary1QueryKey({ region: "DOMESTIC" }) })
  await queryClient.invalidateQueries({ queryKey: getChart1QueryKey("KOSPI") })
  await expect
    .element(screen.getByRole("status").filter({ hasText: "시장 지표를 갱신하지" }))
    .toBeVisible()
  await expect
    .element(screen.getByRole("status").filter({ hasText: "차트를 갱신하지" }))
    .toBeVisible()
  await expect.element(screen.getByRole("tab", { name: /코스피/ })).toBeVisible()
  await expect.element(screen.getByLabelText("KOSPI 선 그래프")).toBeVisible()
  await expect.element(screen.getByRole("alert")).not.toBeInTheDocument()
  failing = false
  await queryClient.invalidateQueries({ queryKey: getSummary1QueryKey({ region: "DOMESTIC" }) })
  await queryClient.invalidateQueries({ queryKey: getChart1QueryKey("KOSPI") })
  await expect.element(screen.getByRole("status")).not.toBeInTheDocument()
})

test("시장별 실패를 전환과 재시도로 복구한다", async () => {
  let failures = 1
  api.defaults.adapter = async (config) => {
    if (
      config.url === "/api/v1/stocks/movers" &&
      config.params.country === "KR" &&
      failures-- > 0
    ) {
      throw reject(config)
    }
    return respond(config)
  }
  const screen = await renderHome()
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("종목 목록을 불러오지 못했습니다")
  await screen.getByRole("tab", { name: "해외 시장" }).click()
  await expect.element(screen.getByRole("link", { name: "US 종목" })).toBeVisible()
  await screen.getByRole("tab", { name: "국내 시장" }).click()
  await expect.element(screen.getByRole("alert")).toBeVisible()
  await screen.getByRole("alert").getByRole("button", { name: "다시 시도" }).click()
  await expect.element(screen.getByRole("link", { name: "KR 종목" })).toBeVisible()
})

test("차트의 400 오류도 차트 안에서 재시도한다", async () => {
  let failures = 1
  api.defaults.adapter = async (config) => {
    if (config.url?.endsWith("/chart") && failures-- > 0) throw reject(config, "P001", 400)
    return respond(config)
  }
  const screen = await renderHome()
  await expect.element(screen.getByRole("alert")).toHaveTextContent("차트를 불러오지 못했습니다")
  await expect.element(screen.getByRole("tab", { name: /코스피/ })).toBeVisible()
  await screen.getByRole("button", { name: "다시 시도" }).click()
  await expect.element(screen.getByLabelText("KOSPI 선 그래프")).toBeVisible()
})

test("동시에 실패한 뉴스와 종목의 재시도를 서로 격리한다", async () => {
  const requests = new Map<string, number>()
  api.defaults.adapter = async (config) => {
    requests.set(config.url!, (requests.get(config.url!) ?? 0) + 1)
    if (
      (config.url === "/api/v1/industries/news" || config.url === "/api/v1/stocks/movers") &&
      requests.get(config.url) === 1
    ) {
      throw reject(config)
    }
    return respond(config)
  }
  const screen = await renderHome()
  const newsError = screen
    .getByRole("alert")
    .filter({ hasText: "산업별 뉴스를 불러오지 못했습니다" })
  const moversError = screen
    .getByRole("alert")
    .filter({ hasText: "종목 목록을 불러오지 못했습니다" })
  await expect.element(newsError).toBeVisible()
  await expect.element(moversError).toBeVisible()
  await newsError.getByRole("button", { name: "다시 시도" }).click()
  await expect.element(screen.getByRole("link", { name: "산업 뉴스" })).toBeVisible()
  await expect.element(moversError).toBeVisible()
  expect(requests.get("/api/v1/stocks/movers")).toBe(1)
  await moversError.getByRole("button", { name: "다시 시도" }).click()
  await expect.element(screen.getByRole("link", { name: "KR 종목" })).toBeVisible()
  expect(requests.get("/api/v1/industries/news")).toBe(2)
  expect(requests.get("/api/v1/stocks/movers")).toBe(2)
})
