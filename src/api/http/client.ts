import { AxiosError, create, isAxiosError } from "axios"
import type { AxiosRequestConfig, AxiosResponse } from "axios"

import { ApiError } from "./error"
import type { ApiErrorKind } from "./error"
import { errorResponseSchema, successResponseSchema } from "./response"

const axiosErrorKinds = {
  [AxiosError.ERR_CANCELED]: "canceled",
  [AxiosError.ECONNABORTED]: "timeout",
  [AxiosError.ETIMEDOUT]: "timeout",
  [AxiosError.ERR_NETWORK]: "network",
} as const satisfies Record<string, ApiErrorKind>

export const api = create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

export const apiRequest = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig) =>
  api.request<T>({ ...config, ...options }).then((response) => response.data)

api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status === 204) {
      response.data = undefined
      return response
    }
    const parsed = successResponseSchema.safeParse(response.data)
    if (!parsed.success) {
      throw new ApiError("서버 응답 형식이 올바르지 않습니다.", {
        kind: "invalid-response",
        status: response.status,
        cause: parsed.error,
      })
    }
    return response
  },
  (error: unknown) => {
    if (!isAxiosError(error)) {
      throw new ApiError(
        error instanceof Error ? error.message : "알 수 없는 API 오류가 발생했습니다.",
        { kind: "unknown", cause: error },
      )
    }

    if (error.response) {
      const parsed = errorResponseSchema.safeParse(error.response.data)
      if (!parsed.success) {
        throw new ApiError("서버 응답 형식이 올바르지 않습니다.", {
          kind: "invalid-response",
          status: error.response.status,
          cause: parsed.error,
        })
      }

      throw new ApiError(parsed.data.error.message, {
        kind: "http",
        status: error.response.status,
        data: parsed.data,
        cause: error,
      })
    }

    const kind =
      error.code && Object.hasOwn(axiosErrorKinds, error.code)
        ? axiosErrorKinds[error.code as keyof typeof axiosErrorKinds]
        : "unknown"

    throw new ApiError(error.message, {
      kind,
      cause: error,
    })
  },
)
