import type { QueryClient } from "@tanstack/react-query"
import { Outlet, createRootRouteWithContext, useRouterState } from "@tanstack/react-router"

import { AgentationReview } from "../agentation/agentationReview"
import { globalUrlStateRouteOptions } from "../hooks/useGlobalUrlState"

interface RouterContext {
  queryClient: QueryClient
}

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <>
      <Outlet />
      <AgentationReview key={pathname} />
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  ...globalUrlStateRouteOptions,
  component: RootLayout,
})
