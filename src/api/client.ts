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
} satisfies Record<string, ApiErrorKind>

export const api = create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

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
    const parsed = successResponseSchema.safeParse(response.data)
    if (!parsed.success) {
      throw new ApiError("서버 응답 형식이 올바르지 않습니다.", {
        kind: "invalid-response",
        status: response.status,
        cause: parsed.error,
      })
    }
    response.data = parsed.data.data
    return response
  },
  (error: unknown) => {
    if (!isAxiosError(error)) {
      throw new ApiError(
        error instanceof Error ? error.message : "알 수 없는 API 오류가 발생했습니다.",
        { kind: "unknown", cause: error },
      )
    }

    const parsed = error.response ? errorResponseSchema.safeParse(error.response.data) : undefined
    if (parsed && !parsed.success) {
      throw new ApiError("서버 응답 형식이 올바르지 않습니다.", {
        kind: "invalid-response",
        status: error.response?.status,
        cause: parsed.error,
      })
    }

    const data = parsed?.data
    const message = data?.error.message ?? error.message
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
  },
)

export const client = {
  async get<T>(url: string, options?: Parameters<typeof api.get>[1]): Promise<T> {
    const response = await api.get<T>(url, options)
    return response.data
  },
  async post<T, D = unknown>(url: string, data?: D, options?: AxiosRequestConfig<D>): Promise<T> {
    const response = await api.post<T, AxiosResponse<T>, D>(url, data, options)
    return response.data
  },
  async put<T, D = unknown>(url: string, data?: D, options?: AxiosRequestConfig<D>): Promise<T> {
    const response = await api.put<T, AxiosResponse<T>, D>(url, data, options)
    return response.data
  },
  async patch<T, D = unknown>(url: string, data?: D, options?: AxiosRequestConfig<D>): Promise<T> {
    const response = await api.patch<T, AxiosResponse<T>, D>(url, data, options)
    return response.data
  },
  async delete<T>(url: string, options?: Parameters<typeof api.delete>[1]): Promise<T> {
    const response = await api.delete<T>(url, options)
    return response.data
  },
}
