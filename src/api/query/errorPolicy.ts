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

export function getErrorDescription(error: ApiError) {
  if (error.kind === "http") {
    switch (error.data?.error.code) {
      case "P002":
        return "해당 종목을 찾을 수 없습니다. 다른 종목을 선택해 주세요."
      case "P007":
        return "시세 정보를 일시적으로 제공할 수 없습니다. 잠시 후 다시 시도해 주세요."
      case "P008":
        return "뉴스 정보를 일시적으로 불러올 수 없습니다. 잠시 후 다시 시도해 주세요."
      case "P009":
        return "뉴스 조회가 일시적으로 제한되고 있습니다. 잠시 후 다시 시도해 주세요."
      case "P010":
        return "공시 정보를 일시적으로 불러올 수 없습니다. 잠시 후 다시 시도해 주세요."
      case "P011":
        return "공시 조회가 일시적으로 제한되고 있습니다. 잠시 후 다시 시도해 주세요."
    }
  }
  return getErrorPolicy(error).message ?? "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
}
