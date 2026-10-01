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
  component: () => (
    <>
      <div className="mx-auto w-full max-w-7xl min-w-0 px-4 md:px-6 lg:px-4">
        <Outlet />
      </div>
      {import.meta.env.MODE === "preview" && <FeedbackReview />}
    </>
  ),
  notFoundComponent: NotFoundPage,
})
