import { createFileRoute } from "@tanstack/react-router"

import { StockPage } from "./page"

export const Route = createFileRoute("/stocks/$code/")({ component: StockPage })
