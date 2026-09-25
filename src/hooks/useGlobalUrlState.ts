import { retainSearchParams, useNavigate, useSearch } from "@tanstack/react-router"
import { z } from "zod"

/**
 * 합의된 전역 URL 상태는 여기에 추가한다.
 * @see https://github.com/SWPY6/fe/issues/26
 */
const globalUrlStateSchema = z.object({
  market: z.enum(["domestic", "overseas"]).default("domestic").catch("domestic"),
})

type GlobalUrlState = z.infer<typeof globalUrlStateSchema>

export const globalUrlStateRouteOptions = {
  validateSearch: globalUrlStateSchema,
  search: {
    middlewares: [
      retainSearchParams<GlobalUrlState>(
        Object.keys(globalUrlStateSchema.shape) as (keyof GlobalUrlState)[],
      ),
    ],
  },
}

/** 합의된 전역 URL 상태를 읽고 변경할 때 사용한다. */
export function useGlobalUrlState() {
  const state = useSearch({ from: "__root__" })
  const navigate = useNavigate()

  const setState = <Key extends keyof GlobalUrlState>(updates: Pick<GlobalUrlState, Key>) =>
    navigate({ to: ".", search: (previous) => ({ ...previous, ...updates }), replace: true })

  return [state, setState] as const
}
