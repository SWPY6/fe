import { DefaultProps, DefaultPropsProvider, Delay } from "@suspensive/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
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
