import { createFileRoute } from "@tanstack/react-router"

import { IndustriesPage } from "./page"

export const Route = createFileRoute("/_layout/industries/")({ component: IndustriesPage })
