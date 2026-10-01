import { createFileRoute } from "@tanstack/react-router"

import { RootPage } from "./page"

export const Route = createFileRoute("/_layout/(root)/")({ component: RootPage })
