export type ApiErrorKind = "http" | "network" | "timeout" | "canceled" | "unknown"

type ApiErrorOptions = ErrorOptions & {
  kind: ApiErrorKind
  status?: number
  data?: unknown
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number
  readonly data?: unknown

  constructor(message: string, options: ApiErrorOptions) {
    super(message, options)

    this.name = "ApiError"
    this.kind = options.kind
    this.status = options.status
    this.data = options.data
  }
}
