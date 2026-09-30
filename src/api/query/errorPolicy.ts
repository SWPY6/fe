import { ApiError } from "../http/error"
import type { ApiErrorKind } from "../http/error"

type ErrorPolicy = { retries: number; message: string | null }

const errorPolicies = {
  network: { retries: 2, message: "서버에 연결할 수 없습니다. 연결 상태를 확인해 주세요." },
  timeout: { retries: 1, message: "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요." },
  canceled: { retries: 0, message: null },
  http: { retries: 0, message: null },
  "invalid-response": { retries: 0, message: "응답을 처리할 수 없습니다." },
  unknown: { retries: 0, message: "예상하지 못한 오류가 발생했습니다." },
} satisfies Record<ApiErrorKind, ErrorPolicy>

const unhandledErrorPolicy = {
  retries: 0,
  message: "예상하지 못한 오류가 발생했습니다.",
} satisfies ErrorPolicy

export function getErrorPolicy(error: unknown) {
  if (!(error instanceof ApiError)) return unhandledErrorPolicy
  if (error.kind === "http" && error.status >= 500) {
    return { retries: 0, message: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." }
  }
  return errorPolicies[error.kind]
}
