import { AxiosError } from "axios"
import { afterEach, expect, expectTypeOf, test } from "vitest"

import { getStockChart, logOut, signUp } from "../generated/api"
import type { StockChart } from "../generated/api.schemas"
import { api } from "./client"
import { ApiError } from "./error"
import type { ErrorResponse } from "./response"

const originalAdapter = api.defaults.adapter

afterEach(() => {
  api.defaults.adapter = originalAdapter
})

test("생성된 GET 함수가 경로와 쿼리를 보내고 성공 데이터를 반환한다", async () => {
  let requestedUrl = ""
  let requestedPeriod: unknown
  const chart = { stockId: 1, period: "3M" }
  api.defaults.adapter = async (config) => {
    requestedUrl = config.url ?? ""
    requestedPeriod = config.params?.period
    return { data: { data: chart }, status: 200, statusText: "OK", headers: {}, config }
  }

  const result = await getStockChart(1, { period: "3M" })

  expect(requestedUrl).toBe("/api/v1/stocks/1/chart")
  expect(requestedPeriod).toBe("3M")
  expect(result).toEqual({ data: chart })
  expectTypeOf(result.data).toEqualTypeOf<StockChart>()
})

test("생성된 POST 함수가 요청 본문을 전송한다", async () => {
  const body = { email: "test@example.com", password: "password", termsAccepted: true }
  let sentBody: unknown
  api.defaults.adapter = async (config) => {
    sentBody = JSON.parse(config.data)
    return { data: { data: { id: 1 } }, status: 201, statusText: "Created", headers: {}, config }
  }

  await signUp(body)

  expect(sentBody).toEqual(body)
})

test("HTTP 오류를 기존 ApiError로 던진다", async () => {
  api.defaults.adapter = async (config) => {
    throw new AxiosError("Bad Request", AxiosError.ERR_BAD_REQUEST, config, null, {
      data: {
        error: {
          name: "InvalidInputValueException",
          code: "P001",
          message: "잘못된 입력값입니다.",
        },
      },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config,
    })
  }

  await expect(getStockChart(1)).rejects.toMatchObject({
    name: "ApiError",
    kind: "http",
    status: 400,
    data: { error: { code: "P001" } },
  })
})

test("ApiError의 kind로 HTTP 오류 데이터 타입을 좁힌다", () => {
  const error: unknown = new ApiError("잘못된 입력값입니다.", {
    kind: "http",
    status: 400,
    data: {
      error: { name: "InvalidInputValueException", code: "P001", message: "잘못된 입력값입니다." },
    },
  })

  expect(error).toBeInstanceOf(ApiError)
  if (error instanceof ApiError) {
    if (error.kind === "http") {
      expectTypeOf(error.status).toEqualTypeOf<number>()
      expectTypeOf(error.data).toEqualTypeOf<ErrorResponse>()
    }

    if (error.kind === "network") {
      expectTypeOf(error.status).toEqualTypeOf<undefined>()
      expectTypeOf(error.data).toEqualTypeOf<undefined>()
    }
  }
})

test("HTTP 응답이 있으면 Axios 네트워크 코드보다 응답을 우선한다", async () => {
  api.defaults.adapter = async (config) => {
    throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config, null, {
      data: {
        error: {
          name: "InvalidInputValueException",
          code: "P001",
          message: "잘못된 입력값입니다.",
        },
      },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config,
    })
  }

  await expect(getStockChart(1)).rejects.toMatchObject({
    kind: "http",
    status: 400,
    data: { error: { code: "P001" } },
  })
})

test("네트워크 오류를 기존 ApiError로 던진다", async () => {
  api.defaults.adapter = async (config) => {
    throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config)
  }

  await expect(getStockChart(1)).rejects.toMatchObject({ name: "ApiError", kind: "network" })
})

test("204 응답은 undefined를 반환한다", async () => {
  api.defaults.adapter = async (config) => ({
    data: "",
    status: 204,
    statusText: "No Content",
    headers: {},
    config,
  })

  const result = await logOut()
  expect(result).toBeUndefined()
  expectTypeOf(result).toEqualTypeOf<void>()
})
