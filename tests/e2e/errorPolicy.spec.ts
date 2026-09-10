import { expect, test } from "./fixtures/errorPolicy"

const queryUrl = "/api/errorPolicy/query"
const mutationUrl = "/api/errorPolicy/mutation"

test.describe("초기 조회", () => {
  test.describe("일시적인 서버 오류", () => {
    test("오류가 지속되면 복구 화면을 표시한다", async ({ page, errorPolicyPage }) => {
      let attempts = 0

      await test.step("조회 API가 모든 요청에 503을 반환하도록 설정한다", async () => {
        await page.clock.install()
        await page.route(
          (url) => url.pathname === queryUrl,
          async (route) => {
            attempts += 1
            await route.fulfill({ status: 503, json: { message: "private" } })
          },
        )
      })

      await test.step("초기 조회 화면을 연다", async () => {
        const firstResponse = page.waitForResponse(
          (response) => new URL(response.url()).pathname === queryUrl && response.status() === 503,
        )
        await errorPolicyPage.openInitialQuery()
        await firstResponse
        await page.clock.runFor(1_000)
      })

      await test.step("복구 화면이 표시되고 요청이 두 번 발생한다", async () => {
        await expect(errorPolicyPage.recoveryScreen).toBeVisible()
        await expect(errorPolicyPage.retryButton).toBeVisible()
        expect(attempts).toBe(2)
      })
    })

    test("서버가 복구되면 데이터를 표시한다", async ({ page, errorPolicyPage }) => {
      let attempts = 0

      await test.step("조회 API가 첫 요청 이후 정상 데이터를 반환하도록 설정한다", async () => {
        await page.clock.install()
        await page.route(
          (url) => url.pathname === queryUrl,
          async (route) => {
            attempts += 1
            if (attempts === 1) {
              await route.fulfill({ status: 503, json: { message: "private" } })
              return
            }
            await route.fulfill({ status: 200, json: { value: "복구된 데이터" } })
          },
        )
      })

      await test.step("초기 조회 화면을 연다", async () => {
        const firstResponse = page.waitForResponse(
          (response) => new URL(response.url()).pathname === queryUrl && response.status() === 503,
        )
        await errorPolicyPage.openInitialQuery()
        await firstResponse

        const recoveredResponse = page.waitForResponse(
          (response) => new URL(response.url()).pathname === queryUrl && response.status() === 200,
        )
        await page.clock.runFor(1_000)
        await recoveredResponse
      })

      await test.step("복구된 데이터가 표시된다", async () => {
        await expect(errorPolicyPage.queryResult).toHaveText("복구된 데이터")
        await expect(errorPolicyPage.recoveryScreen).toHaveCount(0)
        expect(attempts).toBe(2)
      })
    })

    test("복구 화면에서 다시 시도하면 데이터를 표시한다", async ({ page, errorPolicyPage }) => {
      let attempts = 0

      await test.step("조회 API가 두 번 실패한 뒤 정상 데이터를 반환하도록 설정한다", async () => {
        await page.clock.install()
        await page.route(
          (url) => url.pathname === queryUrl,
          async (route) => {
            attempts += 1
            if (attempts <= 2) {
              await route.fulfill({ status: 503, json: { message: "private" } })
              return
            }
            await route.fulfill({ status: 200, json: { value: "다시 조회한 데이터" } })
          },
        )
      })

      await test.step("초기 조회 화면을 연다", async () => {
        const firstResponse = page.waitForResponse(
          (response) => new URL(response.url()).pathname === queryUrl && response.status() === 503,
        )
        await errorPolicyPage.openInitialQuery()
        await firstResponse

        const retryResponse = page.waitForResponse(
          (response) => new URL(response.url()).pathname === queryUrl && response.status() === 503,
        )
        await page.clock.runFor(1_000)
        await retryResponse
      })

      await test.step("복구 화면이 표시된다", async () => {
        await expect(errorPolicyPage.recoveryScreen).toBeVisible()
      })

      await test.step("사용자가 다시 시도한다", async () => {
        const recoveredResponse = page.waitForResponse(
          (response) => new URL(response.url()).pathname === queryUrl && response.status() === 200,
        )
        await errorPolicyPage.retry()
        await recoveredResponse
      })

      await test.step("새로 조회한 데이터가 표시된다", async () => {
        await expect(errorPolicyPage.queryResult).toHaveText("다시 조회한 데이터")
        await expect(errorPolicyPage.recoveryScreen).toHaveCount(0)
        expect(attempts).toBe(3)
      })
    })

    for (const status of [408, 500, 502, 504] as const) {
      test(`${status} 응답이 지속되면 복구 화면을 표시한다`, async ({ page, errorPolicyPage }) => {
        let attempts = 0

        await test.step(`조회 API가 모든 요청에 ${status}를 반환하도록 설정한다`, async () => {
          await page.clock.install()
          await page.route(
            (url) => url.pathname === queryUrl,
            async (route) => {
              attempts += 1
              await route.fulfill({ status, json: { message: "private" } })
            },
          )
        })

        await test.step("초기 조회 화면을 연다", async () => {
          const firstResponse = page.waitForResponse(
            (response) =>
              new URL(response.url()).pathname === queryUrl &&
              response.request().method() === "GET" &&
              response.status() === status,
          )
          await errorPolicyPage.openInitialQuery()
          await firstResponse
          await page.clock.runFor(1_000)
        })

        await test.step("복구 화면이 표시되고 요청이 두 번 발생한다", async () => {
          await expect(errorPolicyPage.recoveryScreen).toBeVisible()
          expect(attempts).toBe(2)
        })
      })
    }
  })

  test.describe("전송 오류", () => {
    test("연결 실패가 지속되면 복구 화면을 표시한다", async ({ page, errorPolicyPage }) => {
      let attempts = 0

      await test.step("모든 조회 요청의 연결이 실패하도록 설정한다", async () => {
        await page.clock.install()
        await page.route(
          (url) => url.pathname === queryUrl,
          async (route) => {
            attempts += 1
            await route.abort("connectionfailed")
          },
        )
      })

      await test.step("초기 조회 화면을 연다", async () => {
        const firstFailure = page.waitForEvent("requestfailed", {
          predicate: (request) => new URL(request.url()).pathname === queryUrl,
        })
        await errorPolicyPage.openInitialQuery()
        await firstFailure

        const secondFailure = page.waitForEvent("requestfailed", {
          predicate: (request) => new URL(request.url()).pathname === queryUrl,
        })
        await page.clock.runFor(1_000)
        await secondFailure

        const thirdFailure = page.waitForEvent("requestfailed", {
          predicate: (request) => new URL(request.url()).pathname === queryUrl,
        })
        await page.clock.runFor(2_000)
        await thirdFailure
      })

      await test.step("복구 화면이 표시되고 요청이 세 번 발생한다", async () => {
        await expect(errorPolicyPage.recoveryScreen).toBeVisible()
        expect(attempts).toBe(3)
      })
    })

    test("요청 시간이 초과되면 복구 화면을 표시한다", async ({ page, errorPolicyPage }) => {
      let attempts = 0

      await test.step("모든 조회 요청이 시간 초과로 종료되도록 설정한다", async () => {
        await page.clock.install()
        await page.route(
          (url) => url.pathname === queryUrl,
          async (route) => {
            attempts += 1
            await route.abort("timedout")
          },
        )
      })

      await test.step("초기 조회 화면을 연다", async () => {
        const firstFailure = page.waitForEvent("requestfailed", {
          predicate: (request) => new URL(request.url()).pathname === queryUrl,
        })
        await errorPolicyPage.openInitialQuery()
        await firstFailure

        const secondFailure = page.waitForEvent("requestfailed", {
          predicate: (request) => new URL(request.url()).pathname === queryUrl,
        })
        await page.clock.runFor(1_000)
        await secondFailure
      })

      await test.step("복구 화면이 표시되고 요청이 두 번 발생한다", async () => {
        await expect(errorPolicyPage.recoveryScreen).toBeVisible()
        expect(attempts).toBe(2)
      })
    })
  })

  test.describe("자동으로 복구하지 않는 서버 응답", () => {
    for (const status of [401, 403, 404, 422, 429, 501] as const) {
      test(`${status} 응답이면 복구 화면을 표시한다`, async ({ page, errorPolicyPage }) => {
        let attempts = 0

        await test.step(`조회 API가 ${status}를 반환하도록 설정한다`, async () => {
          await page.route(
            (url) => url.pathname === queryUrl,
            async (route) => {
              attempts += 1
              await route.fulfill({ status, json: { message: "private" } })
            },
          )
        })

        await test.step("초기 조회 화면을 연다", async () => {
          const responsePromise = page.waitForResponse(
            (response) =>
              new URL(response.url()).pathname === queryUrl &&
              response.request().method() === "GET" &&
              response.status() === status,
          )
          await errorPolicyPage.openInitialQuery()
          await responsePromise
        })

        await test.step("복구 화면이 표시되고 요청이 한 번 발생한다", async () => {
          await expect(errorPolicyPage.recoveryScreen).toBeVisible()
          expect(attempts).toBe(1)
        })
      })
    }
  })
})

test.describe("새로고침", () => {
  test("실패해도 기존 데이터를 유지하고 알림을 표시한다", async ({ page, errorPolicyPage }) => {
    let attempts = 0

    await test.step("조회 API가 기존 데이터 이후 503을 반환하도록 설정한다", async () => {
      await page.clock.install()
      await page.route(
        (url) => url.pathname === queryUrl,
        async (route) => {
          attempts += 1
          if (attempts === 1) {
            await route.fulfill({ status: 200, json: { value: "기존 데이터" } })
            return
          }
          await route.fulfill({ status: 503, json: { message: "private" } })
        },
      )
    })

    await test.step("기존 데이터가 표시된 조회 화면을 연다", async () => {
      const initialResponse = page.waitForResponse(
        (response) => new URL(response.url()).pathname === queryUrl && response.status() === 200,
      )
      await errorPolicyPage.openBackgroundQuery()
      await initialResponse
      await expect(errorPolicyPage.queryResult).toHaveText("기존 데이터")
    })

    await test.step("사용자가 새로고침한다", async () => {
      const failedResponse = page.waitForResponse(
        (response) => new URL(response.url()).pathname === queryUrl && response.status() === 503,
      )
      await errorPolicyPage.refresh()
      await failedResponse

      const retryResponse = page.waitForResponse(
        (response) => new URL(response.url()).pathname === queryUrl && response.status() === 503,
      )
      await page.clock.runFor(1_000)
      await retryResponse
    })

    await test.step("기존 데이터와 오류 알림이 함께 표시된다", async () => {
      await expect(errorPolicyPage.queryResult).toHaveText("기존 데이터")
      await expect(errorPolicyPage.errorNotification).toHaveCount(1)
      await expect(errorPolicyPage.recoveryScreen).toHaveCount(0)
      expect(attempts).toBe(3)
    })
  })
})

test.describe("기능별 오류 처리", () => {
  test("기능 오류 안내만 표시한다", async ({ page, errorPolicyPage }) => {
    let attempts = 0

    await test.step("조회 API가 처리할 수 없는 요청을 반환하도록 설정한다", async () => {
      await page.route(
        (url) => url.pathname === queryUrl,
        async (route) => {
          attempts += 1
          await route.fulfill({ status: 422, json: { message: "private" } })
        },
      )
    })

    await test.step("기능별 오류 처리가 있는 조회 화면을 연다", async () => {
      const responsePromise = page.waitForResponse(
        (response) => new URL(response.url()).pathname === queryUrl && response.status() === 422,
      )
      await errorPolicyPage.openFeatureHandledQuery()
      await responsePromise
    })

    await test.step("기능 오류 안내만 표시된다", async () => {
      await expect(errorPolicyPage.featureError).toBeVisible()
      await expect(errorPolicyPage.recoveryScreen).toHaveCount(0)
      await expect(errorPolicyPage.errorNotification).toHaveCount(0)
      expect(attempts).toBe(1)
    })
  })
})

test.describe("변경 요청", () => {
  test("연결에 실패하면 재실행하지 않고 알림을 표시한다", async ({ page, errorPolicyPage }) => {
    let attempts = 0

    await test.step("변경 API의 연결이 실패하도록 설정한다", async () => {
      await page.route(
        (url) => url.pathname === mutationUrl,
        async (route) => {
          attempts += 1
          await route.abort("connectionfailed")
        },
      )
    })

    await test.step("사용자가 변경을 실행한다", async () => {
      await errorPolicyPage.openMutation()
      const failurePromise = page.waitForEvent("requestfailed", {
        predicate: (request) =>
          new URL(request.url()).pathname === mutationUrl && request.method() === "POST",
      })
      await errorPolicyPage.executeMutation()
      await failurePromise
    })

    await test.step("오류 알림이 표시되고 요청은 한 번만 발생한다", async () => {
      await expect(errorPolicyPage.errorNotification).toHaveCount(1)
      await expect(errorPolicyPage.recoveryScreen).toHaveCount(0)
      expect(attempts).toBe(1)
    })
  })
})

test.describe("연결 상태", () => {
  test("오프라인에서 시작한 조회는 연결이 복구되면 실행된다", async ({
    context,
    page,
    errorPolicyPage,
  }) => {
    let attempts = 0

    await test.step("조회 API가 정상 데이터를 반환하도록 설정한다", async () => {
      await page.route(
        (url) => url.pathname === queryUrl,
        async (route) => {
          attempts += 1
          await route.fulfill({ status: 200, json: { value: "연결 복구 후 데이터" } })
        },
      )
    })

    await test.step("연결 상태 조회 화면을 오프라인으로 준비한다", async () => {
      await errorPolicyPage.openOfflineQuery()
      await context.setOffline(true)
      await expect(errorPolicyPage.offlineNotice).toBeVisible()
    })

    await test.step("사용자가 조회를 시작한다", async () => {
      await errorPolicyPage.startQuery()
    })

    await test.step("요청을 보내지 않고 조회를 보류한다", async () => {
      await expect(errorPolicyPage.requestStatus).toHaveText("paused")
      expect(attempts).toBe(0)
    })

    await test.step("브라우저 연결을 복구한다", async () => {
      const responsePromise = page.waitForResponse(
        (response) => new URL(response.url()).pathname === queryUrl && response.status() === 200,
      )
      await context.setOffline(false)
      await responsePromise
    })

    await test.step("보류했던 요청을 한 번 실행하고 데이터를 표시한다", async () => {
      await expect(errorPolicyPage.queryResult).toHaveText("연결 복구 후 데이터")
      await expect(errorPolicyPage.requestStatus).toHaveText("idle")
      await expect(errorPolicyPage.offlineNotice).toHaveCount(0)
      expect(attempts).toBe(1)
    })
  })
})
