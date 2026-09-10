import { AxiosError, create, isAxiosError } from "axios"
import type { AxiosInstance } from "axios"

import { ApiError } from "./error"
import type { ApiErrorKind } from "./error"

const axiosErrorKinds = {
  [AxiosError.ERR_CANCELED]: "canceled",
  [AxiosError.ECONNABORTED]: "timeout",
  [AxiosError.ETIMEDOUT]: "timeout",
  [AxiosError.ERR_NETWORK]: "network",
} satisfies Record<string, ApiErrorKind>

export const api: AxiosInstance = create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

api.interceptors.response.use(undefined, (error: unknown) => {
  if (!isAxiosError(error)) {
    throw new ApiError(
      error instanceof Error ? error.message : "알 수 없는 API 오류가 발생했습니다.",
      {
        kind: "unknown",
        cause: error,
      },
    )
  }

  const data: unknown = error.response?.data
  const message =
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
      ? data.message
      : error.message
  let kind: ApiErrorKind = error.response ? "http" : "unknown"

  if (error.code && Object.hasOwn(axiosErrorKinds, error.code)) {
    kind = axiosErrorKinds[error.code as keyof typeof axiosErrorKinds]
  }

  throw new ApiError(message, {
    kind,
    status: error.response?.status,
    data,
    cause: error,
  })
})
