import { getSummary1SuspenseQueryOptions } from "@/api/generated/api"
import type { Summary1Params } from "@/api/generated/api.schemas"

export function getMarketSummaryQueryOptions(params: Summary1Params) {
  return getSummary1SuspenseQueryOptions(params, {
    query: {
      select: (response) => ({
        ...response,
        data: {
          ...response.data,
          indicators: [
            ...(response.data.indicators ?? []),
            // 유가 API가 추가되기 전까지 사용하는 고정 더미 데이터.
            {
              indicator: "WTI",
              name: "WTI 유가",
              unit: "USD",
              value: 75.3,
              change: 0.3,
              changeRate: 0.4,
              valueAt: "2026-10-02T00:00:00Z",
            },
          ],
        },
      }),
    },
  })
}
