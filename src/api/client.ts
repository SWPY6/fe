//axios 공통 설정 : API주소, timeout, 헤더. axios로 실제 GET/POST 요청을 보냄.
// import.meta.env.VITE_API_BASE_URL
import { create, isAxiosError } from "axios"

import { ApiError } from "./api-error"
import type { HttpClient, RequestOptions } from "./http-client"

const axiosInstance = create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: {
    Accept: "application/json",
  },
})

function toApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    return new ApiError(error.message, error.response?.status)
  }

  if (error instanceof Error) {
    return new ApiError(error.message)
  }

  return new ApiError("알 수 없는 API 오류가 발생했습니다.")
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)

export const httpClient: HttpClient = {
  async get<T>(path: string, options?: RequestOptions) {
    const response = await axiosInstance.get<T>(path, options)

    return response.data
  },

  async post<TResponse, TBody>(path: string, body: TBody, options?: RequestOptions) {
    const response = await axiosInstance.post<TResponse>(path, body, options)

    return response.data
  },

  async put<TResponse, TBody>(path: string, body: TBody, options?: RequestOptions) {
    const response = await axiosInstance.put<TResponse>(path, body, options)

    return response.data
  },

  async patch<TResponse, TBody>(path: string, body: TBody, options?: RequestOptions) {
    const response = await axiosInstance.patch<TResponse>(path, body, options)

    return response.data
  },

  async delete<T>(path: string, options?: RequestOptions) {
    const response = await axiosInstance.delete<T>(path, options)

    return response.data
  },
}
