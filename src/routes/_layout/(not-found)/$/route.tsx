import { createFileRoute } from "@tanstack/react-router"

import { NotFoundPage } from "../../../not-found/page"

export const Route = createFileRoute("/_layout/(not-found)/$")({
  staticData: {
    testParams: { _splat: "__not-found__" },
  },
  component: NotFoundPage,
})
