import { QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query"
import { CatchBoundary } from "@tanstack/react-router"
import { AxiosError } from "axios"
import { Toaster, toast } from "sonner"
import { afterEach, describe, expect, test } from "vitest"
import { cleanup, render } from "vitest-browser-react"
import { page } from "vitest/browser"

import { api, client } from "./client"
import { queryClient } from "./queryClient"

const originalAdapter = api.defaults.adapter

function RequestScreen() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["request-policy"],
    queryFn: () => client.get<string>("/test/request-policy"),
  })

  if (isPending) return <p>정보를 불러오는 중입니다.</p>
  if (isError) return <p role="alert">정보를 불러올 수 없습니다.</p>
  return <p>{data}</p>
}

function RequestScreenWithOwnMessage() {
  const { isPending, isError } = useQuery({
    queryKey: ["request-policy-own-message"],
    queryFn: () => client.get<unknown>("/test/request-policy"),
    meta: { errorToastMessage: "잠시 후 이 화면을 다시 열어 주세요." },
  })

  if (isPending) return <p>정보를 불러오는 중입니다.</p>
  if (isError) return <p role="alert">정보를 불러올 수 없습니다.</p>
  return <p>정보를 불러왔습니다.</p>
}

function RequestScreenWithBoundary() {
  const { isPending } = useQuery({
    queryKey: ["request-policy-boundary"],
    queryFn: () => client.get<unknown>("/test/request-policy"),
    throwOnError: true,
  })

  return isPending ? <p>정보를 불러오는 중입니다.</p> : <p>정보를 불러왔습니다.</p>
}

function SaveScreen() {
  const save = useMutation({
    mutationFn: () => client.post<unknown>("/test/request-policy"),
  })

  return (
    <>
      <button type="button" onClick={() => save.mutate()}>
        정보 저장
      </button>
      {save.isError && <p role="alert">정보를 저장하지 못했습니다.</p>}
      {save.isSuccess && <p>정보를 저장했습니다.</p>}
    </>
  )
}

afterEach(async () => {
  await cleanup()
  queryClient.clear()
  toast.dismiss()
  api.defaults.adapter = originalAdapter
})

describe("정보를 불러오는 화면", () => {
  test("서버 연결이 잠시 끊겨도 복구되면 정보가 표시된다", async () => {
    let failuresRemaining = 2
    api.defaults.adapter = async (config) => {
      if (failuresRemaining > 0) {
        failuresRemaining -= 1
        throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config)
      }
      return {
        data: { data: "정보를 불러왔습니다." },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }
    }

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <RequestScreen />
        <Toaster />
      </QueryClientProvider>,
    )

    await expect.element(screen.getByText("정보를 불러왔습니다.")).toBeVisible()
    await expect
      .element(page.getByRole("region", { name: /Notifications/ }).getByRole("listitem"))
      .not.toBeInTheDocument()
  }, 10000)

  test("서버가 처음에 늦게 응답해도 정상화되면 정보가 표시된다", async () => {
    let failuresRemaining = 1
    api.defaults.adapter = async (config) => {
      if (failuresRemaining > 0) {
        failuresRemaining -= 1
        throw new AxiosError("timeout", AxiosError.ECONNABORTED, config)
      }
      return {
        data: { data: "정보를 불러왔습니다." },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }
    }

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <RequestScreen />
        <Toaster />
      </QueryClientProvider>,
    )

    await expect.element(screen.getByText("정보를 불러왔습니다.")).toBeVisible()
    await expect
      .element(page.getByRole("region", { name: /Notifications/ }).getByRole("listitem"))
      .not.toBeInTheDocument()
  }, 10000)

  test("서버에 연결할 수 없으면 연결 상태를 확인하라는 토스트가 표시된다", async () => {
    let failuresRemaining = 3
    api.defaults.adapter = async (config) => {
      if (failuresRemaining > 0) {
        failuresRemaining -= 1
        throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config)
      }
      return {
        data: { data: "정보를 불러왔습니다." },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }
    }

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <RequestScreen />
        <Toaster />
      </QueryClientProvider>,
    )

    await expect
      .element(screen.getByRole("alert").filter({ hasText: "정보를 불러올 수 없습니다." }))
      .toBeVisible()
    await expect
      .element(
        page
          .getByRole("region", { name: /Notifications/ })
          .getByRole("listitem")
          .filter({
            hasText: "서버에 연결할 수 없습니다. 연결 상태를 확인해 주세요.",
          }),
      )
      .toBeVisible()
  }, 10000)

  test("서버가 제때 응답하지 않으면 잠시 후 다시 시도하라는 토스트가 표시된다", async () => {
    let failuresRemaining = 2
    api.defaults.adapter = async (config) => {
      if (failuresRemaining > 0) {
        failuresRemaining -= 1
        throw new AxiosError("timeout", AxiosError.ECONNABORTED, config)
      }
      return {
        data: { data: "정보를 불러왔습니다." },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }
    }

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <RequestScreen />
        <Toaster />
      </QueryClientProvider>,
    )

    await expect
      .element(screen.getByRole("alert").filter({ hasText: "정보를 불러올 수 없습니다." }))
      .toBeVisible()
    await expect
      .element(
        page
          .getByRole("region", { name: /Notifications/ })
          .getByRole("listitem")
          .filter({
            hasText: "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
          }),
      )
      .toBeVisible()
  }, 10000)

  test("서버가 오류를 보내면 실패를 표시하고 토스트는 띄우지 않는다", async () => {
    api.defaults.adapter = async (config) => {
      throw new AxiosError("Request failed", AxiosError.ERR_BAD_RESPONSE, config, undefined, {
        data: {
          error: { name: "ServerError", code: "SERVER_ERROR", message: "처리에 실패했습니다." },
        },
        status: 500,
        statusText: "Internal Server Error",
        headers: {},
        config,
      })
    }

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <RequestScreen />
        <Toaster />
      </QueryClientProvider>,
    )

    await expect
      .element(screen.getByRole("alert").filter({ hasText: "정보를 불러올 수 없습니다." }))
      .toBeVisible()
    await expect
      .element(page.getByRole("region", { name: /Notifications/ }).getByRole("listitem"))
      .not.toBeInTheDocument()
  })

  test("서버의 성공 응답에 필수 data가 없으면 응답 오류 토스트를 보여준다", async () => {
    api.defaults.adapter = async (config) => ({
      data: { unexpected: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    })

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <RequestScreen />
        <Toaster />
      </QueryClientProvider>,
    )

    await expect
      .element(screen.getByRole("alert").filter({ hasText: "정보를 불러올 수 없습니다." }))
      .toBeVisible()
    await expect
      .element(
        page
          .getByRole("region", { name: /Notifications/ })
          .getByRole("listitem")
          .filter({
            hasText: "응답을 처리할 수 없습니다.",
          }),
      )
      .toBeVisible()
  })

  test("서버의 오류 응답에 필수 정보가 없으면 응답 오류 토스트를 보여준다", async () => {
    api.defaults.adapter = async (config) => {
      throw new AxiosError("Request failed", AxiosError.ERR_BAD_RESPONSE, config, undefined, {
        data: { error: { name: "ServerError" } },
        status: 500,
        statusText: "Internal Server Error",
        headers: {},
        config,
      })
    }

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <RequestScreen />
        <Toaster />
      </QueryClientProvider>,
    )

    await expect
      .element(screen.getByRole("alert").filter({ hasText: "정보를 불러올 수 없습니다." }))
      .toBeVisible()
    await expect
      .element(
        page
          .getByRole("region", { name: /Notifications/ })
          .getByRole("listitem")
          .filter({
            hasText: "응답을 처리할 수 없습니다.",
          }),
      )
      .toBeVisible()
  })

  test("조회가 취소되면 오류 토스트를 띄우지 않는다", async () => {
    api.defaults.adapter = async (config) => {
      throw new AxiosError("canceled", AxiosError.ERR_CANCELED, config)
    }

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <RequestScreen />
        <Toaster />
      </QueryClientProvider>,
    )

    await expect
      .element(screen.getByRole("alert").filter({ hasText: "정보를 불러올 수 없습니다." }))
      .toBeVisible()
    await expect
      .element(page.getByRole("region", { name: /Notifications/ }).getByRole("listitem"))
      .not.toBeInTheDocument()
  })

  test("예상하지 못한 문제가 생기면 일반 오류 토스트를 보여준다", async () => {
    api.defaults.adapter = async () => {
      throw new Error("unexpected failure")
    }

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <RequestScreen />
        <Toaster />
      </QueryClientProvider>,
    )

    await expect
      .element(screen.getByRole("alert").filter({ hasText: "정보를 불러올 수 없습니다." }))
      .toBeVisible()
    await expect
      .element(
        page
          .getByRole("region", { name: /Notifications/ })
          .getByRole("listitem")
          .filter({
            hasText: "예상하지 못한 오류가 발생했습니다.",
          }),
      )
      .toBeVisible()
  })

  test("화면에 별도 안내가 정해져 있으면 그 문구를 토스트로 보여준다", async () => {
    api.defaults.adapter = async (config) => {
      throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config)
    }

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <RequestScreenWithOwnMessage />
        <Toaster />
      </QueryClientProvider>,
    )

    await expect
      .element(screen.getByRole("alert").filter({ hasText: "정보를 불러올 수 없습니다." }))
      .toBeVisible()
    await expect
      .element(
        page
          .getByRole("region", { name: /Notifications/ })
          .getByRole("listitem")
          .filter({
            hasText: "잠시 후 이 화면을 다시 열어 주세요.",
          }),
      )
      .toBeVisible()
  }, 10000)

  test("서버 응답이 잘못되면 오류 화면과 응답 오류 토스트를 함께 보여준다", async () => {
    api.defaults.adapter = async (config) => ({
      data: { unexpected: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    })

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <CatchBoundary
          getResetKey={() => "request-policy"}
          errorComponent={() => <p role="alert">화면을 표시할 수 없습니다.</p>}
        >
          <RequestScreenWithBoundary />
        </CatchBoundary>
        <Toaster />
      </QueryClientProvider>,
    )

    await expect
      .element(screen.getByRole("alert").filter({ hasText: "화면을 표시할 수 없습니다." }))
      .toBeVisible()
    await expect
      .element(
        page
          .getByRole("region", { name: /Notifications/ })
          .getByRole("listitem")
          .filter({
            hasText: "응답을 처리할 수 없습니다.",
          }),
      )
      .toBeVisible()
  })
})

describe("정보를 저장하는 화면", () => {
  test("저장이 완료되면 성공 상태가 표시되고 오류 토스트는 뜨지 않는다", async () => {
    api.defaults.adapter = async (config) => ({
      data: { data: null },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    })

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <SaveScreen />
        <Toaster />
      </QueryClientProvider>,
    )

    await screen.getByRole("button", { name: "정보 저장" }).click()
    await expect.element(screen.getByText("정보를 저장했습니다.")).toBeVisible()
    await expect
      .element(page.getByRole("region", { name: /Notifications/ }).getByRole("listitem"))
      .not.toBeInTheDocument()
  })

  test("저장 중 서버에 연결할 수 없으면 실패와 연결 안내 토스트가 표시된다", async () => {
    api.defaults.adapter = async (config) => {
      throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config)
    }

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <SaveScreen />
        <Toaster />
      </QueryClientProvider>,
    )

    await screen.getByRole("button", { name: "정보 저장" }).click()
    await expect
      .element(screen.getByRole("alert").filter({ hasText: "정보를 저장하지 못했습니다." }))
      .toBeVisible()
    await expect
      .element(
        page
          .getByRole("region", { name: /Notifications/ })
          .getByRole("listitem")
          .filter({
            hasText: "서버에 연결할 수 없습니다. 연결 상태를 확인해 주세요.",
          }),
      )
      .toBeVisible()
  })

  test("서버가 저장 요청을 거부하면 실패를 표시하고 토스트는 띄우지 않는다", async () => {
    api.defaults.adapter = async (config) => {
      throw new AxiosError("Request failed", AxiosError.ERR_BAD_RESPONSE, config, undefined, {
        data: { error: { name: "Conflict", code: "CONFLICT", message: "저장할 수 없습니다." } },
        status: 409,
        statusText: "Conflict",
        headers: {},
        config,
      })
    }

    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <SaveScreen />
        <Toaster />
      </QueryClientProvider>,
    )

    await screen.getByRole("button", { name: "정보 저장" }).click()
    await expect
      .element(screen.getByRole("alert").filter({ hasText: "정보를 저장하지 못했습니다." }))
      .toBeVisible()
    await expect
      .element(page.getByRole("region", { name: /Notifications/ }).getByRole("listitem"))
      .not.toBeInTheDocument()
  })
})
