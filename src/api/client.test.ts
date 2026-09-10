import { AxiosError, CanceledError } from "axios"
import type { AxiosResponse } from "axios"
import { describe, expect, expectTypeOf, it } from "vitest"

import { api } from "./client"
import { ApiError } from "./error"

describe("api response data", () => {
  it("returns the typed payload and forwards query params and cancellation signal", async () => {
    type User = { id: number }
    const users: User[] = [{ id: 1 }]
    const controller = new AbortController()
    const request = api.get<User[]>("/users", {
      params: { page: 2 },
      signal: controller.signal,
      adapter: async (config) => {
        expect(config.method).toBe("get")
        expect(config.url).toBe("/users")
        expect(config.params).toEqual({ page: 2 })
        expect(config.signal).toBe(controller.signal)
        return { data: users, status: 200, statusText: "OK", headers: {}, config }
      },
    })

    expectTypeOf(request).toEqualTypeOf<Promise<AxiosResponse<User[]>>>()
    await expect(request.then((response) => response.data)).resolves.toBe(users)
  })

  it.each(["post", "put", "patch"] as const)(
    "unwraps %s responses and forwards the body",
    async (method) => {
      const body = { name: "Kim" }
      const payload = { data: { id: 1 } }
      const request = api[method]<typeof payload>("/users", body, {
        adapter: async (config) => {
          expect(config.method).toBe(method)
          expect(config.data).toBe(JSON.stringify(body))
          return { data: payload, status: 200, statusText: "OK", headers: {}, config }
        },
      })

      expectTypeOf(request).toEqualTypeOf<Promise<AxiosResponse<typeof payload>>>()
      await expect(request.then((response) => response.data)).resolves.toBe(payload)
    },
  )

  it("supports a delete response without a body", async () => {
    const request = api.delete<void>("/users/1", {
      adapter: async (config) => {
        expect(config.method).toBe("delete")
        return { data: undefined, status: 204, statusText: "No Content", headers: {}, config }
      },
    })

    expectTypeOf(request).toEqualTypeOf<Promise<AxiosResponse<void>>>()
    await expect(request.then((response) => response.data)).resolves.toBeUndefined()
  })
})

describe("api errors", () => {
  it("preserves the response data and original error", async () => {
    const responseData = {
      message: "요청을 처리할 수 없습니다.",
      code: "USER_NOT_FOUND",
      details: { userId: 1 },
    }
    let originalError: AxiosError | undefined
    const receivedError = await api
      .get("/users/1", {
        adapter: async (config) => {
          originalError = new AxiosError(
            "Request failed",
            AxiosError.ERR_BAD_REQUEST,
            config,
            undefined,
            {
              data: responseData,
              status: 404,
              statusText: "Not Found",
              headers: {},
              config,
            },
          )

          throw originalError
        },
      })
      .catch((error: unknown) => error)

    expect(receivedError).toBeInstanceOf(ApiError)
    expect((receivedError as ApiError).data).toBe(responseData)
    expect((receivedError as ApiError).cause).toBe(originalError)
  })

  it.each([
    {
      responseData: { message: "사용자를 찾을 수 없습니다." },
      expectedMessage: "사용자를 찾을 수 없습니다.",
    },
    {
      responseData: { message: 404 },
      expectedMessage: "Request failed",
    },
  ])(
    "rejects an API error with a safe message and status",
    async ({ responseData, expectedMessage }) => {
      const request = api.get("/users", {
        adapter: async (config) => {
          throw new AxiosError("Request failed", AxiosError.ERR_BAD_REQUEST, config, undefined, {
            data: responseData,
            status: 404,
            statusText: "Not Found",
            headers: {},
            config,
          })
        },
      })

      await expect(request).rejects.toEqual(
        expect.objectContaining({
          name: "ApiError",
          message: expectedMessage,
          status: 404,
        }),
      )
      await expect(request).rejects.toBeInstanceOf(ApiError)
    },
  )

  it("identifies network errors", async () => {
    const request = api.get("/users", {
      adapter: async (config) => {
        throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config)
      },
    })

    await expect(request).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "Network Error",
        kind: "network",
        status: undefined,
      }),
    )
  })

  it("identifies timeout errors", async () => {
    const request = api.get("/users", {
      adapter: async (config) => {
        expect(config.timeout).toBe(10000)
        throw new AxiosError("timeout of 10000ms exceeded", AxiosError.ECONNABORTED, config)
      },
    })

    await expect(request).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "timeout of 10000ms exceeded",
        kind: "timeout",
        status: undefined,
      }),
    )
  })

  it("identifies canceled requests", async () => {
    const request = api.get("/users", {
      adapter: async (config) => {
        throw new CanceledError("canceled", config)
      },
    })

    await expect(request).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "canceled",
        kind: "canceled",
        status: undefined,
      }),
    )
  })

  it("does not classify other Axios errors as network errors", async () => {
    const request = api.get("/users", {
      adapter: async (config) => {
        throw new AxiosError("Invalid request option", AxiosError.ERR_BAD_OPTION, config)
      },
    })

    await expect(request).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "Invalid request option",
        kind: "unknown",
        status: undefined,
      }),
    )
  })

  it("normalizes non-Axios errors", async () => {
    const request = api.get("/users", {
      adapter: async () => {
        throw new Error("Unexpected failure")
      },
    })

    await expect(request).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "Unexpected failure",
        kind: "unknown",
        status: undefined,
      }),
    )
  })
})
