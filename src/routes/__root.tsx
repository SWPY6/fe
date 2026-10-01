import type { QueryClient } from "@tanstack/react-query"
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"

import { FeedbackReview } from "../../feedback/client/FeedbackReview"
import { globalUrlStateRouteOptions } from "../hooks/useGlobalUrlState"
import { NotFoundPage } from "./not-found/page"

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  ...globalUrlStateRouteOptions,
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})
