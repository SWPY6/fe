import type { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts"
import { buildContext } from "react-simplikit"

export type TradingChartContextValue = {
  chart: IChartApi
  container: HTMLDivElement
  lifecycle: { removed: boolean }
}

export const [TradingChartProvider, useTradingChart] =
  buildContext<TradingChartContextValue>("TradingChart.Root")

export const [TradingSeriesProvider, useTradingSeries] = buildContext<{
  series: ISeriesApi<SeriesType>
}>("TradingChart.Series")
