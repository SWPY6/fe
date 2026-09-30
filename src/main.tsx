import { QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider, useRouterState } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "sonner"

import { FeedbackReview } from "../feedback/client/FeedbackReview"
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

export function App() {
  const pathname = useRouterState({ router, select: (state) => state.location.pathname })

  return (
    <>
      <RouterProvider router={router} />
      {import.meta.env.MODE === "preview" && <FeedbackReview key={pathname} />}
      <Toaster />
    </>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
