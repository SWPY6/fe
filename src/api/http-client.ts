// get, post, patch 등 요청 사용 규칙. 가능한 요청 방식과 타입을 약속함.
export type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined>
  signal?: AbortSignal
}

export interface HttpClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>

  post<TResponse, TBody>(path: string, body: TBody, options?: RequestOptions): Promise<TResponse>

  put<TResponse, TBody>(path: string, body: TBody, options?: RequestOptions): Promise<TResponse>

  patch<TResponse, TBody>(path: string, body: TBody, options?: RequestOptions): Promise<TResponse>

  delete<T>(path: string, options?: RequestOptions): Promise<T>
}
