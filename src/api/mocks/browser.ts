import { setupWorker } from "msw/browser"

import {
  getOpenAPIDefinitionMock,
  getReadStocksMockHandler,
  getReadStocksResponseMock,
} from "../generated/api.msw"

const stocks = Array.from({ length: 40 }, (_, index) => ({
  ...getReadStocksResponseMock().data.items[0],
  stockId: index + 1,
}))

export const worker = setupWorker(
  getReadStocksMockHandler(({ request }) => {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") ?? 1)
    const size = Number(searchParams.get("size") ?? 20)

    return {
      data: {
        items: stocks.slice((page - 1) * size, page * size),
        page,
        size,
        total: stocks.length,
      },
    }
  }),
  ...getOpenAPIDefinitionMock(),
)
