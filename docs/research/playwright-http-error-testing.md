# Playwright로 HTTP 오류 정책 검증하기

> 조사일: 2026-09-10
> 범위: Node.js/TypeScript용 Playwright Test와 Playwright 공식 문서

## 결론

이 저장소의 HTTP 오류 정책은 Playwright의 브라우저 네트워크 라우팅으로 검증하는 것이 맞다. 테스트가
브라우저 요청에만 가짜 응답을 넣고, 그 뒤의 `Axios interceptor -> ApiError -> TanStack Query ->
TanStack Router Error Boundary/Sonner` 경로는 실제 애플리케이션 코드를 그대로 통과하게 만든다.

핵심 선택은 다음과 같다.

- HTTP 상태, 헤더와 본문은 `page.route()` + `route.fulfill()`로 만든다.
- 실제 서버 응답의 일부만 바꿔 보는 테스트가 필요할 때만 `route.fetch()` 후
  `route.fulfill({ response, ...overrides })`를 쓴다.
- HTTP 응답 자체가 없는 전송 실패는 `route.abort()`로 만든다. 전체 브라우저의 offline 전환은
  `browserContext.setOffline()`로 별도 검증한다.
- 재시도는 한 handler 안에서 응답 순서를 바꾸고 호출 횟수를 세어 검증한다.
- TanStack Query의 1초/2초 retry delay는 `page.clock`으로 진행시킨다. timeout 전송 실패는 Chromium에서
  `route.abort("timedout")`로 주입한다. `page.clock`은 XHR의 실제 네트워크 시간을 변경하지 않는다.
- 정책의 최종 oracle은 문구 복사본이 아니라 Boundary, 기존 데이터, toast, local UI와 복구 버튼의
  표시 여부다. 네트워크 이벤트와 호출 횟수는 원인 확인을 위한 보조 oracle이다.
- 각 테스트의 `page`/`context` fixture에 route를 등록한다. 서버에 전역 "현재 오류 상태"를 두지 않으면
  병렬 실행에서도 시나리오가 섞이지 않는다.
- 네트워크 interception이 Service Worker에 가려지지 않도록 이 정책 suite에서는
  `serviceWorkers: "block"`을 쓴다.

Playwright는 XHR과 `fetch`를 포함한 페이지의 HTTP/HTTPS 트래픽을 추적하고 변경할 수 있고, API를
아예 호출하지 않는 mock과 실제 응답 수정 방식을 모두 공식 지원한다.
[Network guide](https://playwright.dev/docs/network),
[Mock APIs guide](https://playwright.dev/docs/mock)

## 무엇을 검증하는 테스트인가

[현재 정책](./http-error-policy.md)과 실제 구현을 기준으로 E2E 경계는 다음과 같다.

```text
브라우저에서 조회/변경 실행
  -> 실제 Axios 요청
  -> Playwright route가 HTTP 응답 또는 전송 실패를 주입
  -> 실제 Axios interceptor가 ApiError로 정규화
  -> 실제 TanStack Query가 retry / throwOnError / cache callback 실행
  -> 실제 Router Boundary 또는 Sonner toast 렌더링
  -> Playwright가 사용자 관점 DOM과 복구 동작 검증
```

따라서 Query 함수를 test double로 바꾸면 안 된다. 그러면 이미 있는 component test와 같은 층만 다시
검증하고 Axios 정규화와 브라우저 네트워크를 건너뛴다. 반대로 별도 실제 오류 서버는 필수가 아니다.
`route.fulfill()`가 브라우저 요청에 응답을 제공하므로 상태·본문 정책은 애플리케이션 전체 경로를
거치면서도 결정적으로 만들 수 있다.

현재 화면에는 `api`를 호출하는 사용자 흐름이 없으므로, 구현 단계에서는
`src/routes/errorPolicyTest.tsx`에 정식 E2E fixture file route를 둔다. 별도 HTML이나 Playwright
Component Testing 앱을 만들지 않는다. 이 route는 실제 `RouterProvider` 아래에서 실행되고 루트에
설정된 `defaultErrorComponent`까지 실제 TanStack Router 경로로 검증한다. `validateSearch`로 initial,
background, local, mutation, offline 시나리오를 타입화하고 Query 함수는 실제 `api`를 호출한다.
서버 status 선택 로직은 route에 넣지 않으며 각 테스트의 Playwright network route가 응답을 소유한다.
제품 환경에서는 `beforeLoad`가 `notFound()`를 반환하고 Playwright가 Vite를 `e2e` mode로 실행할 때만
접근 가능하게 한다.

## API 선택

| 목적                                      | 주 API                                             | 선택 이유                                                      |
| ----------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| 한 페이지의 endpoint 응답 바꾸기          | `page.route()`                                     | 테스트별 `page`에 범위를 제한하기 쉽다.                        |
| context의 모든 페이지와 popup 요청 다루기 | `browserContext.route()`                           | page 전반에 적용되고 popup의 첫 요청도 다룰 수 있다.           |
| HTTP 401/403/404/408/429/5xx 만들기       | `route.fulfill()`                                  | status, headers, JSON/body를 직접 정한다.                      |
| 정상 또는 오류 응답 순서 만들기           | 한 route handler + test-local counter              | 실제 Query retry 횟수와 회복 흐름을 함께 검증한다.             |
| 실제 backend 응답 일부 수정하기           | `route.fetch()` -> `route.fulfill()`               | 원 응답을 받아 status/body/headers만 덮어쓸 수 있다.           |
| 응답 없는 transport failure 만들기        | `route.abort()`                                    | HTTP response가 아닌 브라우저 네트워크 실패를 만든다.          |
| 전체 browser offline/online 전환          | `context.setOffline(true/false)`                   | 특정 요청 실패와 별도로 연결 상태 UI와 resume을 검증한다.      |
| 응답 도착 관찰                            | `page.waitForResponse()`                           | action 전에 waiter를 설치하여 특정 응답을 잡는다.              |
| 실패한 요청 관찰                          | `page.waitForEvent("requestfailed")` 또는 listener | abort에는 `Response`가 없으므로 response waiter를 쓰지 않는다. |
| 앱 서버 시작과 readiness                  | `webServer` + `use.baseURL`                        | 테스트 실행과 Vite 수명을 Playwright가 관리한다.               |
| Page Object 제공                          | `test.extend()`                                    | 테스트마다 한 번 생성하고 spec에서 반복 생성하지 않는다.       |
| 시나리오와 행위 구분                      | `test.describe()` + `test.step()`                  | 기능별로 묶고 준비·행위·결과를 실행 보고서에 남긴다.           |
| 사용자 결과 확인                          | role/text locator + web-first `expect`             | 비동기 렌더링이 완료될 때까지 assertion을 자동 재시도한다.     |
| API seed/cleanup 또는 backend 계약 검사   | `APIRequestContext`                                | 브라우저 UI 밖에서 직접 HTTP 호출을 할 때만 쓴다.              |

### `page.route()`와 `browserContext.route()`

두 API 모두 URL에 맞는 요청을 멈추고 handler가 `continue`, `fallback`, `fulfill`, `abort` 중 하나로
처리할 때까지 대기시킨다. page route와 context route가 함께 맞으면 page route가 우선하고, route를
활성화하면 브라우저 HTTP cache가 비활성화된다. 이 cache는 브라우저 HTTP cache이며 TanStack Query
cache와는 다른 층이다.
[page.route API](https://playwright.dev/docs/api/class-page#page-route),
[browserContext.route API](https://playwright.dev/docs/api/class-browsercontext#browser-context-route)

정책 suite의 기본값은 `page.route()`면 충분하다. popup의 첫 navigation은 page route가 가로채지
못하므로 popup이나 새 탭까지 정책 범위라면 `browserContext.route()`를 써야 한다.
[page.route의 popup 제한](https://playwright.dev/docs/api/class-page#page-route)

공통 fixture에서 예상하지 않은 API 호출을 막는 넓은 context route를 두고, 테스트에서 정확한
endpoint의 page route를 두는 fail-closed 구성도 가능하다. 다만 두 계층을 쓸 때는 우선순위를 테스트
코드에 주석으로 남기고, 통과시킬 요청에는 `continue()`가 아니라 다음 handler로 넘기는
`fallback()`을 사용해야 한다.

### `Route` 메서드의 역할

#### `route.fulfill()` — 주력 API

`fulfill()`은 `status`, `headers`, `contentType`, `body`, `json` 또는 파일 `path`로 요청을 완료한다.
status 기본값은 200이고 `json`을 주면 content type도 JSON으로 설정한다. 이 suite에서는 서버의 민감한
`message`가 Boundary에 노출되지 않는지까지 확인할 수 있도록 status와 JSON body를 함께 준다.
[route.fulfill API](https://playwright.dev/docs/api/class-route#route-fulfill)

```ts
await page.route(
  (url) => url.pathname === "/api/e2e/query",
  async (route) => {
    await route.fulfill({
      status: 503,
      json: { message: "DO_NOT_RENDER_SERVER_DETAIL" },
    })
  },
)
```

#### `route.fetch()` — 실제 응답 수정용

`fetch()`는 원 요청을 수행해 `APIResponse`를 돌려주지만 그 자체로 브라우저 route를 완료하지 않는다.
받은 응답을 `fulfill({ response, ... })`에 전달해 일부 필드를 바꾸는 용도다. `maxRetries` 기본값은
0이고 현재는 `ECONNRESET`만 재시도하며 HTTP 상태 코드는 재시도하지 않는다. 앱의 retry 횟수를
검증할 때 Playwright 쪽에서 숨은 재시도가 생기지 않는 기본값이 적절하다.
[route.fetch API](https://playwright.dev/docs/api/class-route#route-fetch)

```ts
await page.route("**/api/profile", async (route) => {
  const response = await route.fetch()
  await route.fulfill({ response, status: 503 })
})
```

이 방식은 backend 가용성과 데이터에 의존하므로 상태별 정책 matrix에는 쓰지 않는다. 실제 backend와
동일한 headers/body를 유지한 채 한 필드만 바꾸어야 하는 소수의 통합 시나리오에만 둔다.

#### `route.continue()`와 `route.fallback()` — 둘은 같지 않다

`continue()`는 optional request override를 적용한 뒤 곧바로 네트워크로 보내며, 다른 matching route
handler는 호출하지 않는다. `fallback()`은 다음 matching handler를 호출하고 더 이상 handler가
없을 때 네트워크로 보낸다. 여러 handler는 **등록의 역순**, 즉 가장 나중에 등록된 것이 먼저 실행된다.
[route.continue API](https://playwright.dev/docs/api/class-route#route-continue),
[route.fallback과 handler 순서](https://playwright.dev/docs/api/class-route#route-fallback)

```ts
await page.route("**/api/**", (route) => route.abort()) // 마지막 방어선, 나중에 실행

await page.route("**/api/**", async (route) => {
  if (route.request().method() !== "GET") {
    await route.fallback()
    return
  }

  await route.fulfill({ status: 503, json: { message: "private" } })
})
```

`fallback({ url, ... })`로 URL을 바꾸더라도 뒤 route들의 matching은 바꾸기 전 원 URL로 이미 결정된다.
따라서 URL rewrite로 route 선택 순서를 제어하면 안 된다.
[route.fallback details](https://playwright.dev/docs/api/class-route#route-fallback)

#### `route.abort()` — HTTP 오류와 분리

`abort()`는 response status를 만드는 것이 아니라 요청 자체를 실패시킨다. `failed`,
`internetdisconnected`, `connectionrefused`, `timedout` 같은 브라우저 network error code를 선택할 수
있다.
[route.abort API](https://playwright.dev/docs/api/class-route#route-abort)

404와 503은 HTTP 관점에서 완료된 응답이므로 `requestfinished`가 발생하고 `requestfailed`가 발생하지
않는다. `requestfailed`는 클라이언트가 HTTP 응답을 얻지 못한 network error에 해당한다.
[Request event sequence](https://playwright.dev/docs/api/class-request),
[page requestfailed event](https://playwright.dev/docs/api/class-page#page-event-request-failed)

이 구분 때문에 다음 두 테스트는 따로 둔다.

- `route.abort("connectionfailed")`: 응답 없는 transport failure가 앱의 `network` 정책, 총 3회 시도,
  Boundary로 이어지는지 검증한다.
- `route.abort("timedout")`: Chromium의 timeout 전송 실패가 앱의 `timeout` 정책과 총 2회 시도로
  이어지는지 검증한다.

`route.abort("timedout")`은 실제로 10초가 흐른 것을 증명하지 않는다. Playwright가 timeout 결과를
브라우저에 주입하여 그 이후의 Axios interceptor와 Query 정책을 검증하는 테스트다. Axios 인스턴스의
기본 제한 시간이 10초인지는 `src/api/client.test.ts`에서 adapter가 받은 config로 별도 검증한다.
실행 확인상 Firefox는 같은 abort를 Axios `network`로 전달하므로 현재 E2E 프로젝트는 Chromium을
명시적인 기준 브라우저로 둔다. 브라우저별 분기로 이 차이를 숨기지 않는다.

### URL matching과 glob의 함정

Playwright network glob은 부분 문자열 검색이 아니라 **URL 전체**에 맞아야 한다. `*`는 `/`를 넘지
않고, `**`는 `/`를 포함해 맞으며, `?`는 임의 문자 wildcard가 아니라 문자 `?` 자체를 뜻한다.
`{png,jpg}` 형태의 선택과 backslash escape도 지원한다. 복잡한 조건은 RegExp를 쓰라는 것이 공식
권고다.
[Glob URL patterns](https://playwright.dev/docs/network#glob-url-patterns)

오류 정책 테스트에서는 query string이나 host 변화 때문에 route가 조용히 빗나가지 않도록 URL
predicate를 기본으로 삼는 편이 가장 명확하다.

```ts
await page.route(
  (url) => url.pathname === "/api/e2e/query",
  async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback()
      return
    }
    // scenario response
  },
)
```

`baseURL`이 설정되어 있고 string pattern이 `*`로 시작하지 않으면 `page.route()`와
`page.waitForResponse()`의 상대 URL은 `new URL()`로 base URL에 resolve된다. `/api/e2e/query`처럼
고정된 same-origin 경로는 이 기능을 써도 된다.
[Browser baseURL behavior](https://playwright.dev/docs/api/class-browser#browser-new-context-option-base-url),
[webServer와 baseURL](https://playwright.dev/docs/test-webserver#adding-a-baseurl)

한 요청이 여러 route에 맞으면 page scope 안에서는 마지막 등록 handler가 먼저 실행된다. one-shot
route에는 `times` 옵션도 있지만, 재시도 결과를 `503 -> 200`처럼 명시할 때는 한 handler의 test-local
배열과 counter가 흐름과 횟수를 한곳에 보여 준다.
[page.route의 handler 우선순위와 times](https://playwright.dev/docs/api/class-page#page-route)

## 재시도 응답을 만드는 작은 helper

helper는 status 정책을 다시 구현하지 않고 "몇 번째 브라우저 요청에 무엇을 반환할지"만 표현해야
한다. 그래야 앱의 policy가 잘못되어도 helper가 같은 잘못을 복제하지 않는다.

```ts
type RouteStep =
  | { kind: "http"; status: number; json?: unknown }
  | { kind: "abort"; errorCode?: "connectionfailed" | "internetdisconnected" }

async function mockQuerySequence(page: Page, steps: readonly RouteStep[]) {
  let attempts = 0

  await page.route(
    (url) => url.pathname === "/api/e2e/query",
    async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback()
        return
      }

      const step = steps[Math.min(attempts, steps.length - 1)]
      attempts += 1

      if (step.kind === "abort") {
        await route.abort(step.errorCode)
        return
      }

      await route.fulfill({ status: step.status, json: step.json ?? {} })
    },
  )

  return { attempts: () => attempts }
}
```

예를 들어 `[503, 503]`은 앱이 더 요청하는 한 마지막 503을 반복하므로 Boundary가 나온 뒤
`attempts() === 2`인지 검증할 수 있다. `[503, 200]`은 한 번 재시도 후 회복되는 경로다. Boundary의
"다시 시도"까지 검증하려면 `[503, 503, 200]`을 주고, 처음 두 실패로 Boundary가 나온 뒤 버튼을 눌러
세 번째 요청의 데이터가 나타나는지 확인한다.

## `waitForResponse`와 `expectResponse`

Node.js/TypeScript의 Page API 이름은 `page.waitForResponse()`다. action이 너무 빨리 응답을 발생시키는
race를 막기 위해 공식 예시처럼 **Promise를 action 전에 만들되 그 자리에서는 await하지 않는다**.
string, RegExp 또는 `Response` predicate를 받을 수 있고 predicate에서는 URL, status와 원 요청 method를
함께 확인할 수 있다.
[page.waitForResponse API](https://playwright.dev/docs/api/class-page#page-wait-for-response),
[Network event examples](https://playwright.dev/docs/network#network-events)

```ts
const responsePromise = page.waitForResponse(
  (response) =>
    new URL(response.url()).pathname === "/api/e2e/query" &&
    response.request().method() === "GET" &&
    response.status() === 503,
)

await page.getByRole("button", { name: "조회" }).click()
const response = await responsePromise
expect(response.status()).toBe(503)
```

Node/TypeScript Page에는 `page.expectResponse()`라는 메서드가 없다. 여기서 말하는
"expect response"는 `waitForResponse()`가 돌려준 browser `Response`에 일반 `expect`를 적용하는
패턴이다. Playwright의 `expect(response).toBeOK()`는 `APIRequestContext`가 반환하는
`APIResponse`용 matcher이므로 browser `Response`를 기다리는 위 경우와 구별한다.
[Page의 waitForResponse 반환 타입](https://playwright.dev/docs/api/class-page#page-wait-for-response),
[APIResponse assertions](https://playwright.dev/docs/api/class-apiresponseassertions)

또한 `waitForResponse()`는 HTTP 503을 관찰할 수 있지만 `route.abort()`에는 response가 없다. abort
시나리오에서 이를 기다리면 timeout까지 멈춘다. 필요하면 action 전에 다음처럼 `requestfailed` waiter를
설치하고, 정책의 최종 결과는 여전히 UI로 검증한다.

```ts
const failurePromise = page.waitForEvent("requestfailed", {
  predicate: (request) => new URL(request.url()).pathname === "/api/e2e/query",
})
await page.getByRole("button", { name: "조회" }).click()
await failurePromise
```

응답 waiter를 모든 테스트에 넣을 필요는 없다. locator assertion이 최종 UI를 기다리고 handler counter가
재시도를 증명한다면 waiter는 network event를 특별히 검증하는 테스트에만 쓰는 편이 단순하다.

## retry delay에는 `page.clock` 사용

TanStack Query의 기본 retry delay는 페이지의 `setTimeout`을 사용하므로 `page.clock`으로 결정적으로
진행시킨다. clock은 페이지가 시간 관련 API를 사용하기 전에 설치해야 하므로 navigation보다 먼저
`page.clock.install()`을 호출한다. 첫 실패가 관찰된 뒤 `page.clock.runFor(1000)`으로 첫 retry를,
network 정책에서는 이어서 `runFor(2000)`으로 두 번째 retry를 실행한다.
[Clock guide](https://playwright.dev/docs/clock),
[Clock API](https://playwright.dev/docs/api/class-clock)

```ts
await page.clock.install()

const firstResponse = page.waitForResponse(
  (response) => new URL(response.url()).pathname === "/api/e2e/query",
)
await page.goto("/errorPolicyTest?scenario=initial")
await firstResponse

await page.clock.runFor(1000)
await expect(page.getByRole("alert")).toBeVisible()
```

`page.clock`이 문서상 교체하는 대상은 `Date`, `setTimeout`, `setInterval`, animation/idle callback,
`performance`와 event timestamp다. XHR의 native network timeout은 그 목록에 없으므로 Axios timeout을
clock으로 흉내 내지 않는다. timeout 결과는 `route.abort("timedout")`로 주입하고 clock은 그 다음 Query
retry delay만 진행시킨다. 고정 sleep인 `page.waitForTimeout()`은 사용하지 않는다. Playwright도 테스트
코드에서 이 메서드를 쓰면 flaky해진다고 명시하고 locator assertion이나 network event 같은 신호를
기다리도록 권고한다.
[page.waitForTimeout 경고](https://playwright.dev/docs/api/class-page#page-wait-for-timeout)

## Error Boundary와 toast assertion

Boundary를 검증할 때 구현 class나 React 내부 상태를 읽지 않는다. 현재 fallback의 접근 가능한 계약을
사용한다.

```ts
const alert = page.getByRole("alert")
await expect(alert).toBeVisible()
await expect(page.getByRole("button", { name: "다시 시도" })).toBeVisible()
```

Playwright의 web-first locator assertions는 조건이 맞을 때까지 locator를 다시 조회하고 assertion을
재시도한다. `expect(await locator.isVisible()).toBe(true)` 같은 즉시 검사나 `waitForTimeout()`보다
`await expect(locator).toBeVisible()/toHaveText()`를 써야 비동기 Query/React 렌더링에 안정적이다.
[Assertions guide](https://playwright.dev/docs/test-assertions),
[공식 best practice](https://playwright.dev/docs/best-practices#use-web-first-assertions)

정책별 주요 UI oracle은 다음과 같다.

| 정책                              | 최종 UI oracle                                | 보조 oracle               |
| --------------------------------- | --------------------------------------------- | ------------------------- |
| 초기 Query 최종 실패              | `role=alert`, retry 버튼                      | endpoint 요청 횟수        |
| retry 중 성공                     | 데이터가 보이고 alert가 없음                  | 실패+성공 요청 횟수       |
| Boundary reset                    | retry 버튼 후 alert가 사라지고 데이터가 보임  | reset 뒤 새 요청 1회      |
| cached data의 background 실패     | 기존 데이터 유지, 정책 toast 노출, alert 없음 | 최종 시도 횟수            |
| `meta.errorPresentation: "local"` | feature local UI, 공통 Boundary/toast 없음    | endpoint 요청 횟수        |
| Mutation 전송 실패                | toast 표시, 자동 retry 없음                   | 요청 1회                  |
| canceled Query                    | Boundary와 toast 모두 없음                    | 요청이 canceled/failed 됨 |

`page.on("pageerror")`는 페이지 안의 **uncaught exception**에만 발생한다. Error Boundary가 렌더링됐는지
판정하는 API가 아니다. `page.on("console")`은 페이지의 `console.log`, `console.error` 등 console API
호출을 전달한다. React 개발 모드가 처리된 오류를 console에 기록할 수 있으므로 모든
`console.error`를 곧바로 정책 실패로 만들면 정상 Boundary 테스트가 취약해질 수 있다.
[pageerror event](https://playwright.dev/docs/api/class-page#page-event-page-error),
[console event](https://playwright.dev/docs/api/class-page#page-event-console)

권장 용도는 UI assertion을 primary로 유지하면서, `pageerror`와 console을 test-local 배열에 수집해
실패 artifact 또는 예상하지 않은 오류의 보조 진단으로 쓰는 것이다. 사용 중인 Playwright가 지원하면
최근 오류와 console 메시지를 각각 `page.pageErrors()`와 `page.consoleMessages()`로도 읽을 수 있다.
두 API는 현재 최대 200개를 보관한다.
[page.pageErrors API](https://playwright.dev/docs/api/class-page#page-page-errors),
[page.consoleMessages API](https://playwright.dev/docs/api/class-page#page-console-messages)

## `webServer` 구성

Playwright Test의 `webServer`는 테스트 전에 로컬 개발 서버를 시작하고 readiness URL이 응답할 때까지
기다리며, `use.baseURL`을 함께 두면 `page.goto()`와 route/response wait API에서 상대 URL을 쓸 수
있다. `reuseExistingServer`는 로컬에서는 기존 서버를 재사용하고 CI에서는 충돌을 실패로 드러내도록
보통 `!process.env.CI`로 둔다. 기본 startup timeout은 60초이며 여러 web server도 배열로 실행할 수
있다.
[Web server guide](https://playwright.dev/docs/test-webserver)

```ts
export default defineConfig({
  webServer: {
    command: "pnpm dev --host 127.0.0.1",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
    serviceWorkers: "block",
    trace: "retain-on-failure",
  },
})
```

status matrix를 전부 `route.fulfill()`로 처리하면 `webServer`는 프런트엔드 한 개면 된다. backend를
Playwright가 별도로 띄울 필요가 없다. 실제 backend 응답을 수정하는 `route.fetch()` 시나리오를
추가할 때만 두 번째 server를 `webServer` 배열에 넣는다.

실패 시 trace를 남기면 action별 locator, 소요 시간과 DOM snapshot을 볼 수 있다. `retain-on-failure`는
모든 실행을 기록하되 성공한 실행의 trace를 제거하는 옵션이다.
[Trace 설정](https://playwright.dev/docs/test-use-options#recording-options),
[Trace Viewer](https://playwright.dev/docs/trace-viewer)

## Service Worker 정책

`page.route()`와 `browserContext.route()`는 Service Worker가 이미 가로챈 요청을 intercept하지 못한다.
Playwright는 native routing event가 보이지 않으면 `serviceWorkers: "block"`을 권고하며, 이 옵션은
Service Worker 등록 자체를 막는다.
[Routing과 Service Worker 제한](https://playwright.dev/docs/network#missing-network-events-and-service-workers),
[serviceWorkers context option](https://playwright.dev/docs/api/class-browser#browser-new-context-option-service-workers)

따라서 HTTP 오류 정책 suite는 `block`으로 고정한다. 실제 제품이 Service Worker의 cache/offline
동작에 의존하게 되면 그것은 별도 Chromium project에서 `allow`로 검증한다. Service Worker 지원과
route 가능 요청에는 Chromium 전용 제한이 있고, 공식 문서도 Service Worker를 끄면 실제 페이지와
동작이 달라질 수 있다고 경고한다.
[Service Workers guide](https://playwright.dev/docs/service-workers)

## `APIRequestContext`의 역할과 한계

`APIRequestContext`는 UI 밖에서 endpoint를 직접 호출해 backend 상태를 준비하거나 정리하고, API
계약을 검증하는 도구다. 각 BrowserContext의 `context.request`와 `page.request`는 같은 cookie jar를
공유하고 `Set-Cookie` 응답도 browser cookies에 반영한다. `playwright.request.newContext()`로 만든
인스턴스는 cookie storage가 독립적이다.
[APIRequestContext API](https://playwright.dev/docs/api/class-apirequestcontext),
[Context request와 isolated request](https://playwright.dev/docs/api-testing#context-request-vs-global-request)

이 suite에서 `request.get()`으로 503을 받았다고 해서 Error Boundary 정책이 검증되는 것은 아니다.
직접 API 호출에는 페이지의 Axios interceptor, TanStack Query retry/throwOnError, React render가
참여하지 않기 때문이다. 이는 API의 성격에서 따르는 결론이다. `APIRequestContext`는 다음에만 쓴다.

- 로그인 또는 fixture 데이터 준비/정리
- backend 자체 상태/본문 계약 확인
- context cookie 공유가 의도된 인증 준비

브라우저 정책 검증의 입력 주입은 `page/context.route()`가 맡고, 최종 oracle은 페이지 DOM이 맡는다.
실제 backend response를 브라우저 경로에 통과시키며 바꾸려면 직접 `request.get()`으로 UI 대신
검사하는 것이 아니라 `route.fetch()`와 `route.fulfill()`을 조합한다.

## offline은 transport abort와 별도 시나리오다

`browserContext.setOffline(true/false)`는 해당 browser context가 offline인 상태를 emulation한다.
[browserContext.setOffline API](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-offline),
[Offline emulation](https://playwright.dev/docs/emulation#offline)

앱 문서를 기준으로 이것은 `onlineManager`의 paused/resume과 offline banner를 검증하는 데 사용한다.
페이지와 JavaScript를 먼저 로드한 다음 offline으로 바꾸고 Query action을 일으켜야, 처음부터 앱 문서
자체가 로드되지 않는 상황을 피할 수 있다. 이후 online으로 복구하고 멈췄던 요청이 진행되어 데이터가
표시되는지 확인한다.

반면 online으로 인식 중인 개별 API 요청이 응답 없이 실패하는 정책은 `route.abort()`로 검증한다.
둘을 분리해야 "offline이라 Query가 시작되지 않음"과 "시작된 요청이 network error로 실패하여
재시도함"을 각각 고정할 수 있다.

## 병렬 실행 격리

Playwright Test의 `page`와 `context` fixture는 test-scoped이고 각 테스트는 새로운 격리
BrowserContext를 받는다. cookie, local/session storage 등은 다른 context와 공유되지 않는다. browser
process는 worker 안에서 공유해도 각 테스트의 context는 새 환경이다.
[Built-in fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures),
[BrowserContext isolation](https://playwright.dev/docs/browser-contexts)

기본적으로 test file들은 여러 worker process에서 병렬 실행되고, 한 파일 안의 테스트는 순서대로
실행된다. `fullyParallel`을 켜면 같은 파일의 테스트도 별도 worker에서 실행될 수 있다.
[Parallelism guide](https://playwright.dev/docs/test-parallel)

이 보장을 실제 suite에서 유지하는 규칙은 다음과 같다.

- route는 각 테스트의 `page` 또는 `context`에 등록한다.
- 응답 sequence와 `attempts` counter는 테스트 함수의 local closure에 둔다.
- Vite server process나 module global에 `currentErrorStatus` 같은 mutable scenario 상태를 두지 않는다.
- 테스트끼리 이전 Query cache, 로그인, toast 또는 route가 남아 있다고 가정하지 않는다.
- backend data를 실제로 변경하는 테스트가 생기면 `testInfo.testId` 또는 worker index로 record를
  분리한다. Playwright도 병렬 테스트의 외부 backend data를 고유 식별자로 격리하도록 안내한다.
  [Parallel test data isolation](https://playwright.dev/docs/test-parallel#avoid-shared-state)
- E2E에서는 `reuseContext`를 켜지 않는다. 공식 문서도 fresh context 격리를 훼손하는 이 옵션을 E2E에
  쓰지 말라고 명시한다.
  [reuseContext 제한](https://playwright.dev/docs/api/class-testoptions#test-options-reuse-context)

이 구조에서는 모든 worker가 같은 Vite dev server를 공유해도 서버는 정적 앱만 제공하고, 각 status
시나리오는 서로 다른 BrowserContext의 route에 있으므로 충돌하지 않는다.

## 우선 구현할 테스트 matrix

아래 순서는 "한 상태마다 비슷한 테스트를 복사"하기보다 정책의 서로 다른 결과와 retry 횟수를 먼저
고정한다.

| 우선순위 | 시나리오                           | route sequence                 | 기대 결과                                       |
| -------- | ---------------------------------- | ------------------------------ | ----------------------------------------------- |
| 1        | 초기 503 최종 실패                 | `503, 503`                     | 총 2회, Boundary와 503 문구, 서버 detail 비노출 |
| 1        | 503 일시 실패 후 회복              | `503, 200`                     | 총 2회, 데이터 표시, Boundary 없음              |
| 1        | Boundary에서 수동 복구             | `503, 503, 200`                | alert -> "다시 시도" -> 데이터, 총 3회          |
| 1        | network 최종 실패                  | `abort` 반복                   | 총 3회, Boundary                                |
| 1        | 초기 non-retry 401/403/404/422/429 | 각 status 1회                  | 총 1회, Boundary                                |
| 2        | 408/500/502/504 retry 수           | 같은 status 반복               | 총 2회, Boundary                                |
| 2        | cached data background 503         | `200`, refetch 뒤 `503, 503`   | 기존 data 유지, toast, Boundary 없음            |
| 2        | local presentation 422             | `422`                          | feature local UI, 공통 Boundary/toast 없음      |
| 2        | Mutation network 실패              | `abort`                        | 총 1회, toast                                   |
| 2        | offline pause/resume               | page load 후 offline -> online | offline 안내, online 뒤 요청/데이터             |
| 3        | timeout 전송 실패                  | `abort("timedout")`            | clock으로 retry 진행, 총 2회, Boundary          |
| 3        | Query cancel                       | pending 중 화면 이탈/취소      | 공통 Boundary/toast 없음                        |

status별 문구를 table-driven으로 묶을 수 있지만, retry·background·reset·local·Mutation은 결과 구조가
다르므로 별도 테스트로 유지한다. 특히 503 한 개만으로 다음 네 계약을 모두 대표시키지 않는다.

1. 자동 retry 횟수
2. retry 중 성공
3. 최종 실패의 Boundary
4. cached background 실패의 toast

## 구현 순서와 성공 기준

1. **Playwright Test 기반 추가**

   `webServer`, `baseURL`, `serviceWorkers: "block"`, failure trace를 설정한다.
   검증: 빈 smoke test가 로컬과 CI 명령에서 Vite를 자동 시작하고 종료한다.

2. **TanStack Router E2E fixture route 추가**

   `createFileRoute`와 `validateSearch`를 사용해 initial Query, background refetch, Mutation, local
   presentation, offline 시나리오를 명시한다. 별도 HTML이나 별도 React root를 만들지 않고
   실제 앱의 `RouterProvider`, `QueryProvider`, root `defaultErrorComponent` 안에서 실행한다. 서버
   status 선택 코드는 앱 route에 넣지 않는다.
   검증: 정상 `route.fulfill({ status: 200 })`에서 각 사용자 action이 실제 요청을 한 번 만든다.

3. **Page Object 추가**

   페이지 진입, 의미 기반 locator와 사용자 action만 캡슐화하고 네트워크 조건과 assertion은 spec에 둔다.
   custom fixture가 테스트마다 Page Object를 한 번 제공하며, spec은 기능별 `describe`와 의미에 맞는
   `test.step`으로 준비·행위·결과를 구분한다.
   검증: spec에 `querySelector`나 임의 sleep 없이 POM을 통해 화면을 조작한다.

4. **핵심 policy matrix 고정**

   503, network abort, non-retry 4xx, Boundary reset, background toast부터 작성한다.
   검증: Boundary/toast/local UI의 표시 여부와 정확한 요청 횟수를 함께 assertion한다.

5. **연결 상태와 timeout 분리 검증**

   `setOffline()` pause/resume과 `route.abort("timedout")`을 서로 다른 테스트로 둔다. Query retry delay는
   `page.clock.runFor()`로 진행한다.
   검증: offline은 요청 전 pause/resume을, timeout은 sleep 없이 1회 retry를 보여 주며 API client 기본
   timeout 10초는 unit test가 config 값으로 고정한다.

6. **병렬성과 진단 검증**

   suite를 여러 worker와 반복 실행하고 failure trace 및 page/console diagnostics를 확인한다.
   검증: 실행 순서나 worker 수를 바꾸어도 attempt count와 UI 결과가 같고 공유 scenario 상태가 없다.

이 계획의 완료 기준은 단순히 "mock한 503 response를 보았다"가 아니다. 브라우저가 만든 실제 요청에
오류를 주입했을 때 정책이 정한 retry 횟수, 최종 표시 방식, cached data 유지, local opt-out과 수동
복구가 사용자가 보는 화면에서 모두 고정되어야 한다.
