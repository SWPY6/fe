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
import { afterEach, expect, test } from "vitest"
import { cleanup, render } from "vitest-browser-react"

import { api } from "@/api/http/client"
import { globalUrlStateRouteOptions } from "@/hooks/useGlobalUrlState"

import { moversSearchSchema } from "./-schema"
import { MoversPage } from "./page"

const originalAdapter = api.defaults.adapter
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity } },
})

async function renderMovers() {
  const rootRoute = createRootRoute({
    ...globalUrlStateRouteOptions,
    component: Outlet,
  })
  const layoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: "_layout",
    component: Outlet,
  })
  const moversRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: "/movers/",
    validateSearch: moversSearchSchema,
    component: MoversPage,
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={createRouter({
          routeTree: rootRoute.addChildren([layoutRoute.addChildren([moversRoute])]),
          history: createMemoryHistory({ initialEntries: ["/movers"] }),
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

test("조회 실패를 목록 영역에 표시하고 재시도로 목록과 페이지네이션을 복구한다", async () => {
  let requests = 0
  api.defaults.adapter = async (config) => {
    requests += 1
    if (requests === 1) throw new AxiosError("연결 실패", AxiosError.ERR_NETWORK, config)
    return {
      config,
      status: 200,
      statusText: "OK",
      headers: {},
      data: {
        data: {
          stocks: Array.from({ length: 21 }, (_, index) => ({
            stockId: index + 1,
            name: `종목 ${index + 1}`,
          })),
        },
      },
    }
  }

  const screen = await renderMovers()
  await expect.element(screen.getByRole("alert")).toHaveTextContent("연결 상태를 확인")
  await expect.element(screen.getByRole("searchbox", { name: "종목 검색" })).toBeEnabled()
  await expect.element(screen.getByRole("combobox", { name: "산업 필터" })).toBeEnabled()
  await expect.element(screen.getByRole("table")).not.toBeInTheDocument()

  await screen.getByRole("button", { name: "다시 시도" }).click()

  await expect.element(screen.getByRole("link", { name: "종목 1", exact: true })).toBeVisible()
  await expect.element(screen.getByText("1 / 2", { exact: true })).toBeVisible()
  await expect.element(screen.getByRole("alert")).not.toBeInTheDocument()
  expect(requests).toBe(2)
})

test("오류 중 시장을 바꿀 수 있고 이전 시장의 실패도 재시도로 복구한다", async () => {
  const countries: string[] = []
  api.defaults.adapter = async (config) => {
    countries.push(config.params.country)
    if (countries.length === 1) {
      throw new AxiosError("시세 조회 실패", AxiosError.ERR_BAD_RESPONSE, config, undefined, {
        config,
        status: 502,
        statusText: "Bad Gateway",
        headers: {},
        data: { error: { name: "MarketDataUnavailable", code: "P007", message: "시세 조회 실패" } },
      })
    }
    return {
      config,
      status: 200,
      statusText: "OK",
      headers: {},
      data: { data: { stocks: [{ stockId: 1, name: `${config.params.country} 종목` }] } },
    }
  }

  const screen = await renderMovers()
  await expect.element(screen.getByRole("alert")).toHaveTextContent("잠시 후 다시 시도")
  await screen.getByRole("button", { name: "해외 시장" }).click()
  await expect.element(screen.getByRole("link", { name: "US 종목" })).toBeVisible()
  await screen.getByRole("button", { name: "국내 시장" }).click()
  await expect.element(screen.getByRole("alert")).toBeVisible()
  await screen.getByRole("button", { name: "다시 시도" }).click()
  await expect.element(screen.getByRole("link", { name: "KR 종목" })).toBeVisible()
  expect(countries).toEqual(["KR", "US", "KR"])
})
