import { createFileRoute } from "@tanstack/react-router"

import { MoversPage } from "./page"

export const Route = createFileRoute("/_layout/movers/")({ component: MoversPage })
