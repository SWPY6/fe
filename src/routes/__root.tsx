import type { QueryClient } from "@tanstack/react-query"
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"

import { globalUrlStateRouteOptions } from "../hooks/useGlobalUrlState"

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  ...globalUrlStateRouteOptions,
  component: Outlet,
})
