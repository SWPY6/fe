import type { ErrorResponse } from "./response"

type ApiErrorDetails =
  | { kind: "http"; status: number; data: ErrorResponse }
  | { kind: "invalid-response"; status: number; data?: never }
  | {
      kind: "network" | "timeout" | "canceled" | "unknown"
      status?: never
      data?: never
    }

export type ApiErrorKind = ApiErrorDetails["kind"]

type TypedApiError = ApiError & ApiErrorDetails

export class ApiError extends Error {
  static [Symbol.hasInstance](value: unknown): value is TypedApiError {
    return Function.prototype[Symbol.hasInstance].call(this, value)
  }

  readonly kind: ApiErrorKind
  readonly status?: number
  readonly data?: ErrorResponse

  constructor(message: string, options: ErrorOptions & ApiErrorDetails) {
    super(message, options)

    this.name = "ApiError"
    this.kind = options.kind
    this.status = options.status
    this.data = options.data
  }
}
