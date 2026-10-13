import { DefaultProps, DefaultPropsProvider, Delay } from "@suspensive/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { getRouteSegments, hasMissingPathParams } from "@tanstack/router-core"
import { OverlayProvider } from "overlay-kit"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "sonner"
// 소스 변환으로 삽입하는 렌더러도 최초 의존성 스캔에서 함께 준비한다.
import "boneyard-js/react"

import { queryClient } from "./api/query/queryClient"
import { routeTree } from "./routeTree.gen"

import "./index.css"

if (import.meta.env.VITE_ENABLE_MSW === "true") {
  const { worker } = await import("./api/mocks/browser")
  await worker.start({ onUnhandledRequest: "bypass" })
}

const router = createRouter({
  routeTree,
  context: { queryClient },
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }

  interface StaticDataRouteOption {
    testParams?: Record<string, string>
  }
}

if (import.meta.env.VITE_CAPTURE_SKELETONS === "true") {
  const urls = new Set<string>()
  const errors: string[] = []

  for (const route of Object.values(router.routesById)) {
    if (route.options.path === undefined) continue

    const params = { ...route.options.staticData?.testParams }
    let parent = route.parentRoute
    while (parent) {
      for (const [key, value] of Object.entries(parent.options.staticData?.testParams ?? {})) {
        if (!Object.hasOwn(params, key)) params[key] = value
      }
      parent = parent.parentRoute
    }

    const segments = getRouteSegments(route)
    if (segments && hasMissingPathParams(segments, params)) {
      errors.push(
        `${route.id} (${route.fullPath}): staticData.testParams에 필수 경로 파라미터를 지정해야 합니다.`,
      )
      continue
    }

    try {
      const location = router.buildLocation({
        to: route.fullPath,
        params,
        hash: "",
      })
      const matches = router.matchRoutes(location.pathname, location.search, { throwOnError: true })
      if (!matches.some((match) => match.routeId === route.id)) {
        throw new Error(`${location.href}가 해당 라우트에 매칭되지 않습니다.`)
      }
      urls.add(location.href)
    } catch (error) {
      errors.push(`${route.id}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const manifest = document.createElement("script")
  manifest.id = "skeleton-routes"
  manifest.type = "application/json"
  manifest.textContent = JSON.stringify({ urls: [...urls], errors })
  document.head.append(manifest)
}

const defaultProps = new DefaultProps({
  Delay: { ms: 200 },
  Suspense: { fallback: <Delay>로딩중</Delay> },
})

export function App() {
  return (
    <DefaultPropsProvider defaultProps={defaultProps}>
      <OverlayProvider>
        <RouterProvider router={router} />
      </OverlayProvider>
      <Toaster />
    </DefaultPropsProvider>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
