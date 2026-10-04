import type { IChartApi } from "lightweight-charts"
import { createContext, type RefObject } from "react"

export type ChartContextValue = {
  chart: IChartApi
  alive: RefObject<boolean>
  root: HTMLElement
}

export const ChartContext = createContext<ChartContextValue | null>(null)
