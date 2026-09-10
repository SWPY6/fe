import { ApiError } from "../api/error"
import type { ApiErrorKind } from "../api/error"

type ErrorPolicy = { retries: number; message: string | null }

const errorPolicies = {
  network: { retries: 2, message: "서버에 연결할 수 없습니다. 연결 상태를 확인해 주세요." },
  timeout: { retries: 1, message: "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요." },
  canceled: { retries: 0, message: null },
  http: { retries: 0, message: "요청을 처리할 수 없습니다." },
  unknown: { retries: 0, message: "예상하지 못한 오류가 발생했습니다." },
} satisfies Record<ApiErrorKind, ErrorPolicy>

const httpPolicies: Partial<Record<number, ErrorPolicy>> = {
  401: { retries: 0, message: "로그인이 필요합니다. 로그인 상태를 확인해 주세요." },
  403: { retries: 0, message: "접근 권한이 없습니다." },
  404: { retries: 0, message: "요청한 정보를 찾을 수 없습니다." },
  408: errorPolicies.timeout,
  429: { retries: 0, message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
  500: { retries: 1, message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
  502: { retries: 1, message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요." },
  503: { retries: 1, message: "서비스를 일시적으로 이용할 수 없습니다." },
  504: errorPolicies.timeout,
}

export function getErrorPolicy(error: unknown) {
  if (!(error instanceof ApiError)) return errorPolicies.unknown
  if (error.kind !== "http") return errorPolicies[error.kind]
  return httpPolicies[error.status ?? 0] ?? errorPolicies.http
}
