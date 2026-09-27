import { createFileRoute } from "@tanstack/react-router"

import { RootPage } from "./page"

export const Route = createFileRoute("/(root)/")({ component: RootPage })
