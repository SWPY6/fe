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

import { getNewsQueryKey, getDisclosuresQueryKey, getChartQueryKey } from "@/api/generated/api"
import { api } from "@/api/http/client"
import { globalUrlStateRouteOptions } from "@/hooks/useGlobalUrlState"

import "@/index.css"

import { stockSearchSchema } from "./-schema"
import { StockPage } from "./page"

const originalAdapter = api.defaults.adapter
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity } },
})

function respond(config: InternalAxiosRequestConfig) {
  let data: unknown
  switch (config.url?.split("/").at(-1)) {
    case "1":
    case "2":
      data = { profile: { name: "테스트 종목", ticker: "000001" }, country: "KR", currency: "KRW" }
      break
    case "quote":
      data = { price: 1000, currency: "KRW", changeRate: 1, indicators: { previousClose: 990 } }
      break
    case "chart":
      data = {
        currency: "KRW",
        candles: [
          { tradeAt: "2026-10-01", open: 900, high: 1100, low: 800, close: 1000 },
          { tradeAt: "2026-10-02", open: 1000, high: 1200, low: 900, close: 1100 },
        ],
      }
      break
    case "news":
      data = {
        country: "KR",
        total: 1,
        items: [{ documentId: "1", title: "종목 뉴스", url: "https://example.com/news" }],
      }
      break
    case "disclosures":
      data = {
        country: "KR",
        total: 1,
        coverage: "MAPPED",
        items: [
          {
            provider: "DART",
            providerDocumentId: "1",
            title: "종목 공시",
            url: "https://example.com/filing",
          },
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

async function renderStock() {
  const root = createRootRoute({ ...globalUrlStateRouteOptions, component: Outlet })
  const layout = createRoute({ getParentRoute: () => root, id: "_layout", component: Outlet })
  const stock = createRoute({
    getParentRoute: () => layout,
    path: "/stocks/$stockId",
    component: Outlet,
  })
  const index = createRoute({
    getParentRoute: () => stock,
    path: "/",
    validateSearch: stockSearchSchema,
    component: StockPage,
  })
  const router = createRouter({
    routeTree: root.addChildren([layout.addChildren([stock.addChildren([index])])]),
    history: createMemoryHistory({
      initialEntries: ["/stocks/1?from=2026-10-01&to=2026-10-02&interval=1D"],
    }),
  })
  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { screen, router }
}

afterEach(async () => {
  await cleanup()
  queryClient.clear()
  api.defaults.adapter = originalAdapter
})

test.each([
  ["summary", "종목 정보를 불러오지 못했습니다", "P007", "시세 정보를 일시적으로"],
  ["chart", "차트를 불러오지 못했습니다", "P007", "시세 정보를 일시적으로"],
  ["news", "뉴스를 불러오지 못했습니다", "P008", "뉴스 정보를 일시적으로"],
  ["news", "뉴스를 불러오지 못했습니다", "P009", "뉴스 조회가 일시적으로 제한"],
  ["disclosures", "공시를 불러오지 못했습니다", "P010", "공시 정보를 일시적으로"],
  ["disclosures", "공시를 불러오지 못했습니다", "P011", "공시 조회가 일시적으로 제한"],
])("%s의 %s (%s)를 격리하고 같은 요청으로 복구한다", async (endpoint, title, code, description) => {
  const requests: InternalAxiosRequestConfig[] = []
  api.defaults.adapter = async (config) => {
    if (
      config.url === (endpoint === "summary" ? "/api/v1/stocks/1" : `/api/v1/stocks/1/${endpoint}`)
    ) {
      requests.push(config)
      if (requests.length === 1)
        throw reject(config, code, code === "P009" || code === "P011" ? 503 : 502)
    }
    return respond(config)
  }
  const { screen } = await renderStock()
  await screen
    .getByRole("tab", { name: endpoint === "disclosures" ? "공시" : "뉴스", exact: true })
    .click()
  const alert = screen.getByRole("alert").filter({ hasText: title })
  await expect.element(alert).toHaveTextContent(description)
  await expect.element(screen.getByRole("combobox", { name: "차트 유형" })).toBeEnabled()
  await expect.element(screen.getByRole("button", { name: "3개월" })).toBeEnabled()
  await expect.element(screen.getByText("전일 종가", { exact: true })).toBeVisible()
  await alert.getByRole("button", { name: "다시 시도" }).click()
  await expect.element(alert).not.toBeInTheDocument()
  await expect.element(screen.getByRole("heading", { name: "테스트 종목" })).toBeVisible()
  await expect.element(screen.getByLabelText("라인 차트")).toBeVisible()
  expect(requests).toHaveLength(2)
  expect(requests[1].params).toEqual(requests[0].params)
})

test("같은 시세를 쓰는 두 영역도 캐시 삭제 없이 복구한다", async () => {
  let requests = 0
  api.defaults.adapter = async (config) => {
    if (config.url?.endsWith("/quote") && ++requests === 1) throw reject(config)
    return respond(config)
  }
  const { screen } = await renderStock()
  const quoteError = screen.getByRole("alert").filter({ hasText: "시세를 불러오지 못했습니다" })
  const indicatorsError = screen
    .getByRole("alert")
    .filter({ hasText: "주요 지표를 불러오지 못했습니다" })
  await expect.element(quoteError).toBeVisible()
  await expect.element(indicatorsError).toBeVisible()
  await quoteError.getByRole("button", { name: "다시 시도" }).click()
  await expect.element(quoteError).not.toBeInTheDocument()
  await indicatorsError.getByRole("button", { name: "다시 시도" }).click()
  await expect.element(screen.getByText("전일 종가", { exact: true })).toBeVisible()
  expect(requests).toBe(2)
})

test("차트 오류 중 기간을 바꾸면 새 기간을 조회한다", async () => {
  const requests: InternalAxiosRequestConfig[] = []
  api.defaults.adapter = async (config) => {
    if (config.url?.endsWith("/chart")) {
      requests.push(config)
      if (requests.length === 1) throw reject(config)
    }
    return respond(config)
  }
  const { screen } = await renderStock()
  await expect.element(screen.getByRole("alert")).toBeVisible()
  await screen.getByRole("button", { name: "3개월" }).click()
  await expect.element(screen.getByLabelText("라인 차트")).toBeVisible()
  expect(requests).toHaveLength(2)
  expect(requests[1].params).not.toEqual(requests[0].params)
})

test("종목 변경 시 이전 종목의 오류를 해제한다", async () => {
  api.defaults.adapter = async (config) => {
    if (config.url === "/api/v1/stocks/1") throw reject(config)
    return respond(config)
  }
  const { screen, router } = await renderStock()
  await expect.element(screen.getByRole("alert")).toBeVisible()
  await router.navigate({ to: "/stocks/$stockId", params: { stockId: "2" } })
  await expect.element(screen.getByRole("heading", { name: "테스트 종목" })).toBeVisible()
  await expect.element(screen.getByRole("alert")).not.toBeInTheDocument()
})

test("없는 종목은 반복 재시도 대신 종목 선택으로 안내한다", async () => {
  api.defaults.adapter = async (config) => {
    if (config.url === "/api/v1/stocks/1") throw reject(config, "P002", 404)
    return respond(config)
  }
  const { screen } = await renderStock()
  const alert = screen.getByRole("alert")
  await expect.element(alert).toHaveTextContent("종목을 찾을 수 없습니다")
  await expect
    .element(alert.getByRole("link", { name: "다른 종목 찾기" }))
    .toHaveAttribute("href", "/movers?market=domestic")
  await expect.element(alert.getByRole("button", { name: "다시 시도" })).not.toBeInTheDocument()
})

test.each(["news", "disclosures"])(
  "%s의 갱신 제한 시 기존 자료를 유지하며 수동으로 재시도한다",
  async (endpoint) => {
    let failing = false
    api.defaults.adapter = async (config) => {
      if (failing && config.url?.endsWith(`/${endpoint}`))
        throw reject(config, endpoint === "news" ? "P009" : "P011", 503)
      return respond(config)
    }
    const { screen } = await renderStock()
    await screen
      .getByRole("tab", { name: endpoint === "news" ? "뉴스" : "공시", exact: true })
      .click()
    const article = screen.getByRole("link", {
      name: endpoint === "news" ? /종목 뉴스/ : /종목 공시/,
    })
    await expect.element(article).toBeVisible()
    failing = true
    await queryClient.invalidateQueries({
      queryKey: endpoint === "news" ? getNewsQueryKey(1) : getDisclosuresQueryKey(1),
    })
    await expect.element(screen.getByRole("status")).toHaveTextContent("조회가 일시적으로 제한")
    await expect.element(article).toBeVisible()
    failing = false
    await screen.getByRole("button", { name: "다시 시도" }).click()
    await expect.element(screen.getByRole("status")).not.toBeInTheDocument()
    await expect.element(article).toBeVisible()
  },
)

test("차트 갱신 실패 시 기존 차트를 유지한다", async () => {
  let failing = false
  api.defaults.adapter = async (config) => {
    if (failing && config.url?.endsWith("/chart")) throw reject(config)
    return respond(config)
  }
  const { screen } = await renderStock()
  await expect.element(screen.getByLabelText("라인 차트")).toBeVisible()
  failing = true
  await queryClient.invalidateQueries({ queryKey: getChartQueryKey(1) })
  await expect.element(screen.getByLabelText("라인 차트")).toBeVisible()
  await expect.element(screen.getByRole("alert")).not.toBeInTheDocument()
})
