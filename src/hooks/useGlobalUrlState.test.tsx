import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { cleanup, render } from "vitest-browser-react"

import { globalUrlStateRouteOptions, useGlobalUrlState } from "./useGlobalUrlState"

function StateView() {
  const [{ market }] = useGlobalUrlState()
  return <span>{market}</span>
}

function StateControl() {
  const [{ market }, setGlobalUrlState] = useGlobalUrlState()
  return (
    <>
      <span>{market}</span>
      <button onClick={() => setGlobalUrlState({ market: "domestic" })}>국내</button>
      <button onClick={() => setGlobalUrlState({ market: "overseas" })}>해외</button>
    </>
  )
}

let previousUrl: string

beforeEach(() => {
  previousUrl = window.location.href
})

afterEach(async () => {
  await cleanup()
  window.history.replaceState(null, "", previousUrl)
})

describe("useGlobalUrlState", () => {
  test("URL에 값이 없으면 기본값을 반환한다", async () => {
    window.history.replaceState(null, "", "/")

    const rootRoute = createRootRoute({
      ...globalUrlStateRouteOptions,
      component: Outlet,
    })
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: StateView,
    })
    const routeTree = rootRoute.addChildren([indexRoute])
    const screen = await render(<RouterProvider router={createRouter({ routeTree })} />)

    await expect.element(screen.getByText("domestic")).toBeVisible()
  })

  test("URL에 잘못된 값이 있으면 기본값을 반환한다", async () => {
    window.history.replaceState(null, "", "/?market=invalid")

    const rootRoute = createRootRoute({
      ...globalUrlStateRouteOptions,
      component: Outlet,
    })
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: StateView,
    })
    const routeTree = rootRoute.addChildren([indexRoute])
    const screen = await render(<RouterProvider router={createRouter({ routeTree })} />)

    await expect.element(screen.getByText("domestic")).toBeVisible()
  })

  test("URL에 지정된 값을 반환한다", async () => {
    window.history.replaceState(null, "", "/?market=overseas")

    const rootRoute = createRootRoute({
      ...globalUrlStateRouteOptions,
      component: Outlet,
    })
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: StateView,
    })
    const routeTree = rootRoute.addChildren([indexRoute])
    const screen = await render(<RouterProvider router={createRouter({ routeTree })} />)

    await expect.element(screen.getByText("overseas")).toBeVisible()
  })

  test("화면 이동 시 전역 URL 상태를 유지한다", async () => {
    window.history.replaceState(null, "", "/other?market=overseas")

    const rootRoute = createRootRoute({
      ...globalUrlStateRouteOptions,
      component: Outlet,
    })
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: StateView,
    })
    const otherRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "other",
      component: StateView,
    })
    const routeTree = rootRoute.addChildren([indexRoute, otherRoute])
    const router = createRouter({ routeTree })
    const screen = await render(<RouterProvider router={router} />)

    await expect.element(screen.getByText("overseas")).toBeVisible()
    await router.navigate({ to: "/" })
    expect(window.location.pathname).toBe("/")
    await expect.element(screen.getByText("overseas")).toBeVisible()
    expect(new URLSearchParams(window.location.search).get("market")).toBe("overseas")
  })

  test("기본값으로 변경한 상태를 URL에 반영한다", async () => {
    window.history.replaceState(null, "", "/?market=overseas")

    const rootRoute = createRootRoute({
      ...globalUrlStateRouteOptions,
      component: Outlet,
    })
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: StateControl,
    })
    const routeTree = rootRoute.addChildren([indexRoute])
    const screen = await render(<RouterProvider router={createRouter({ routeTree })} />)

    await expect.element(screen.getByText("overseas")).toBeVisible()
    await screen.getByRole("button", { name: "국내" }).click()
    await expect.element(screen.getByText("domestic")).toBeVisible()
    expect(new URLSearchParams(window.location.search).get("market")).toBe("domestic")
  })

  test("다른 값으로 변경한 상태를 URL에 반영한다", async () => {
    window.history.replaceState(null, "", "/")

    const rootRoute = createRootRoute({
      ...globalUrlStateRouteOptions,
      component: Outlet,
    })
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: StateControl,
    })
    const routeTree = rootRoute.addChildren([indexRoute])
    const screen = await render(<RouterProvider router={createRouter({ routeTree })} />)

    await expect.element(screen.getByText("domestic")).toBeVisible()
    await screen.getByRole("button", { name: "해외" }).click()
    await expect.element(screen.getByText("overseas")).toBeVisible()
    expect(new URLSearchParams(window.location.search).get("market")).toBe("overseas")
  })
})
