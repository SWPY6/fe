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

import { industriesSearchSchema } from "./-schema"
import { IndustriesPage } from "./page"

const originalAdapter = api.defaults.adapter
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity } },
})

async function renderIndustries() {
  const rootRoute = createRootRoute({
    ...globalUrlStateRouteOptions,
    component: Outlet,
  })
  const layoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: "_layout",
    component: Outlet,
  })
  const industriesRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: "/industries/",
    validateSearch: industriesSearchSchema,
    component: IndustriesPage,
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={createRouter({
          routeTree: rootRoute.addChildren([layoutRoute.addChildren([industriesRoute])]),
          history: createMemoryHistory({ initialEntries: ["/industries"] }),
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

test("산업 조회 실패 후 필터를 유지하며 다시 요청한다", async () => {
  let requests = 0
  api.defaults.adapter = async (config) => {
    requests += 1
    if (requests === 1) throw new AxiosError("연결 실패", AxiosError.ERR_NETWORK, config)
    return {
      config,
      status: 200,
      statusText: "OK",
      headers: {},
      data: { data: [{ code: "AUTO", displayName: "자동차", rank: 1, stocks: [] }] },
    }
  }
  const screen = await renderIndustries()
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("산업별 동향을 불러오지 못했습니다")
  await expect.element(screen.getByRole("button", { name: "상승 산업" })).toBeEnabled()
  await screen.getByRole("button", { name: "다시 시도" }).click()
  await expect.element(screen.getByRole("heading", { name: "자동차" })).toBeVisible()
  expect(requests).toBe(2)
})

test("실패 상태에서 필터와 시장을 바꾸면 새로운 조건으로 조회한다", async () => {
  const requests: string[] = []
  api.defaults.adapter = async (config) => {
    requests.push(`${config.params.country}-${config.params.filter}`)
    if (requests.length === 1) throw new AxiosError("연결 실패", AxiosError.ERR_NETWORK, config)
    return {
      config,
      status: 200,
      statusText: "OK",
      headers: {},
      data: {
        data: [
          {
            code: "AUTO",
            displayName: `${config.params.country} ${config.params.filter}`,
            stocks: [],
          },
        ],
      },
    }
  }
  const screen = await renderIndustries()
  await expect.element(screen.getByRole("alert")).toBeVisible()
  await screen.getByRole("button", { name: "상승 산업" }).click()
  await expect.element(screen.getByRole("heading", { name: "KR RISING" })).toBeVisible()
  await screen.getByRole("tab", { name: "해외 시장" }).click()
  await expect.element(screen.getByRole("heading", { name: "US RISING" })).toBeVisible()
  expect(requests).toEqual(["KR-ALL", "KR-RISING", "US-RISING"])
})
