import { createFileRoute } from "@tanstack/react-router"

import { StockPage } from "./page"

export const Route = createFileRoute("/_layout/stocks/$code/")({ component: StockPage })
