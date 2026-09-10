# HTTP 오류 처리 정책 조사와 설계

## 이번 구현에 적용한 범위

전역 설정은 `src/query/client.ts`, 오류별 재시도 횟수와 사용자 문구는 `src/query/error.ts`에 둔다.
TanStack Router의 기존 Error Boundary를 사용하고 `QueryErrorResetBoundary`와 연결하여 재시도 버튼으로
복구한다. 백그라운드 실패는 Sonner 알림을 사용한다.

- network는 최대 2회, timeout 및 408/500/502/503/504는 최대 1회 재시도한다.
- 초기 조회의 처리되지 않은 오류는 4xx도 공통 fallback으로 보낸다. 자체 오류 UI를 가진 기능만
  `meta.errorPresentation: "local"`을 지정하면 Boundary와 전역 알림을 생략한다. 이 선택은 재시도
  횟수를 바꾸지 않는다. 기본값에서도 사용처가 오류 종류별 분기를 작성할 필요가 없도록 한 결정이다.
- 캐시 데이터가 있으면 유지하고 최종 실패 알림만 표시한다. 같은 Query는 queryHash를 알림 ID로
  사용한다. Mutation의 network/timeout에는 자동 재시도 없이 공통 문구
  “서버 응답을 받지 못했습니다. 네트워크 연결 상태를 확인해 주세요.”를 표시한다.
  이는 [Apple 연결 문제 안내](https://support.apple.com/ko-kr/108093)의 연결 상태 확인 방식을 참고해
  작성한 앱 문구이며, 서버 작업의 성공·실패를 단정하지 않는다.
- 현재 인증 상태 모듈과 로그인 라우트가 없으므로 401은 인증 필요 안내를 제공한다. 아래의 세션
  무효화 정책은 인증 기능을 연결할 때 적용하며 임의의 로그인 URL로 이동시키지 않는다.
- 429 자동 재시도와 Retry-After 파싱, 운영 오류 수집 시스템은 이번 구현에 포함하지 않는다.

아래는 조사 근거와 인증 등 후속 연결 지점을 포함한 설계 기록이다. 위 항목이 현재 구현 범위를
명시하며, 특히 401 세션 처리와 운영 로그 수집을 구현 완료로 해석하지 않는다.

## 결론

오류 처리는 다음 세 레이어로 나눈다.

```text
Axios interceptor
  AxiosError를 ApiError로 정규화한다.
  오류의 사실(kind, status, data, cause)만 기록한다.
            |
            v
TanStack Query 전역 정책
  Query 재시도, offline pause, 최종 실패의 전역 부수 효과,
  Error Boundary 전달 여부를 결정한다.
            |
            v
화면/기능
  403, 404, 폼 검증 오류처럼 기능 맥락이 필요한 최종 오류만 표현한다.
```

interceptor에서는 재시도, 토스트, 로그아웃, 화면 이동을 하지 않는다. 반대로 각 화면에서는
`network`, `timeout`, `canceled`, `5xx`를 반복해서 분기하지 않는다. 전자는 전송 라이브러리의 오류를
앱이 이해하는 사실로 바꾸는 경계이고, 후자는 그 사실에 대한 앱 정책을 한 번 적용하는 경계다.

이 문서의 구체적인 정책은 다음을 전제로 한다.

- Query는 조회 작업이며 반복 실행해도 서버 상태를 변경하지 않는다.
- Mutation은 서버 상태를 변경하므로 별도 보장 없이는 반복 실행이 안전하지 않다.
- 브라우저 앱이며 TanStack Query의 기본 `networkMode: "online"`을 사용한다.
- 인증 토큰 자동 갱신은 현재 범위에 포함하지 않는다. 401은 현재 세션을 무효화하는 정책으로 다룬다.

## 라이브러리가 보장하는 것과 앱이 결정할 것

Axios는 기본적으로 2xx 밖의 HTTP 응답을 reject하고, 응답이 있으면 `error.response`, 요청했지만
응답이 없으면 `error.request`, 요청 준비 단계의 실패이면 그 둘 없이 오류를 제공한다. 또한
`ERR_NETWORK`는 실제 오프라인뿐 아니라 브라우저의 CORS 또는 Mixed Content 차단으로도 발생할 수
있다. 따라서 `kind: "network"`는 **오프라인 확정**이 아니라 **사용 가능한 HTTP 응답을 받지 못한
전송 실패**라는 뜻이어야 한다. [Axios 오류 처리 문서](https://axios-http.com/docs/handling_errors)

TanStack Query는 HTTP 상태 코드를 해석하지 않는다. Query 함수가 throw하거나 rejected Promise를
반환하면 그 값을 오류로 취급할 뿐이다. 따라서 401을 로그아웃으로 처리할지, 404를 빈 결과로
볼지, 5xx를 재시도할지는 전부 앱 정책이다. [TanStack Query 함수 문서](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions)

HTTP 명세 역시 상태의 의미를 정할 뿐 특정 UI나 재시도 횟수를 정하지 않는다. 아래 정책표의
“재시도 횟수”, “Boundary”, “토스트”는 라이브러리 기본값이 아니라 이 앱에서 채택할 결정이다.

## 1. Axios 경계: `ApiError` 정규화

### 책임

interceptor의 실패 경로는 모든 Axios 오류를 다음 계약으로 바꿔 throw한다.

| 필드      | 의미                                                | 상위 레이어의 사용법                                     |
| --------- | --------------------------------------------------- | -------------------------------------------------------- |
| `kind`    | `http \| network \| timeout \| canceled \| unknown` | 전역 정책의 1차 분기 기준                                |
| `status`  | HTTP 응답이 있을 때의 상태 코드                     | `kind === "http"`의 세부 정책                            |
| `data`    | 응답 본문 원본인 `unknown`                          | 기능이 계약을 검증한 뒤에만 사용                         |
| `message` | 구조적으로 안전하게 고른 오류 설명                  | 진단용 기본 설명; 그대로 전역 토스트하지 않음            |
| `cause`   | 원래 `AxiosError` 또는 알 수 없는 원인              | 로깅/디버깅용; 정책 코드에서 Axios 속성을 다시 읽지 않음 |

429나 503의 `Retry-After`를 실제로 지원할 때만 `retryAfterMs?: number`를 위 계약에 추가한다. 이 값은
interceptor가 헤더의 초 단위 값 또는 HTTP-date를 밀리초 지연으로 정규화한다. TanStack Query가
`cause.response.headers`를 다시 읽게 하면 Axios 격리가 깨지므로 그렇게 하지 않는다. 429 응답은
`Retry-After`를 포함할 수 있고, 503의 `Retry-After`는 서비스가 얼마나 오래 이용 불가능할지를
나타낸다. [RFC 6585 §4](https://www.rfc-editor.org/rfc/rfc6585.html#section-4),
[RFC 9110 §10.2.3](https://www.rfc-editor.org/rfc/rfc9110.html#section-10.2.3)

### 분류 우선순위

| 조건                                  | `ApiError.kind` | 비고                                                     |
| ------------------------------------- | --------------- | -------------------------------------------------------- |
| Axios `ERR_CANCELED`                  | `canceled`      | `AbortSignal` 또는 명시적 취소                           |
| Axios timeout 코드                    | `timeout`       | `ETIMEDOUT`; Axios 기본 설정에서는 `ECONNABORTED`도 가능 |
| `error.response` 존재                 | `http`          | 본문이 비어도 `status`로 판단 가능                       |
| `ERR_NETWORK` 등 응답 없는 전송 실패  | `network`       | 오프라인, CORS, Mixed Content 등을 구별할 수 없음        |
| 그 밖의 Axios 오류 또는 비-Axios 오류 | `unknown`       | 설정, 변환, 프로그래밍 오류를 포함할 수 있음             |

Axios는 명시적 취소를 `ERR_CANCELED`로 정의한다. timeout은 기본적으로 `ECONNABORTED`이고
`transitional.clarifyTimeoutError: true`일 때 `ETIMEDOUT`으로 구별된다. 따라서 timeout과 기타 abort를
엄밀히 구별하려면 이 Axios 설정을 켜는 것이 맞다. 기존 어댑터 호환 때문에 `ECONNABORTED`도
timeout으로 받을 경우에는 이것이 Axios의 완전한 보장이 아닌 호환 정책임을 테스트로 고정한다.
[Axios 오류 코드와 timeout 문서](https://axios-http.com/docs/handling_errors#handling-timeouts)

서버의 `data.message`는 문자열 여부까지만 확인할 수 있을 뿐 사용자에게 노출해도 안전한 문구라는
보장은 없다. 전역 UI는 `kind`와 `status`로 정한 앱 문구를 사용하고, 서버 메시지가 필요한 폼 같은
기능만 응답 계약을 검증해서 사용한다.

## 2. Query의 연결 상태와 재시도

### `networkMode: "online"`을 유지한다

TanStack Query의 기본 `online` 모드에서는 오프라인으로 알려진 상태에서 Query와 Mutation을 실행하지
않고 `fetchStatus: "paused"`로 둔다. 연결이 돌아오면 새 refetch가 아니라 멈춘 실행을 계속한다.
요청 도중 오프라인이 되면 다음 재시도도 멈췄다가 연결 복구 후 이어진다.
[TanStack Query Network Mode](https://github.com/TanStack/query/blob/50680b98c4dc5ac4d97f7762014fa83f09a41d9a/docs/framework/react/guides/network-mode.md#L6-L22)

기본 `onlineManager`는 처음에는 online이라고 가정하고 브라우저 `online`/`offline` 이벤트를 듣는다.
따라서 다음 두 흐름은 다르다.

```text
이미 offline으로 감지됨
  Query 시작 -> queryFn/요청 실행 안 함 -> paused -> reconnect -> 실행

online으로 판단했으나 Axios 요청 실패
  요청 실행 -> ApiError("network") -> retry 판단 -> 지연
  -> 그 사이 offline 감지 시 paused -> reconnect -> 남은 retry 계속
```

[TanStack Query onlineManager](https://tanstack.com/query/latest/docs/reference/onlineManager)는 실제 인터넷
도달성을 보장하지 않는다. 또한 Axios의 `ERR_NETWORK`에는 CORS 차단도 포함될 수 있으므로
`ERR_NETWORK` 하나만 보고 `onlineManager.setOnline(false)`를 호출하지 않는다. 플랫폼이 React Native
등으로 바뀌어 신뢰할 수 있는 연결 API가 생길 때만 `onlineManager.setEventListener`를 교체한다.

### Query 재시도 정책

Query의 전역 `retry`는 다음 조건만 재시도한다.

| 최종 `ApiError` 사실         | 자동 재시도             | 이유                                                                |
| ---------------------------- | ----------------------- | ------------------------------------------------------------------- |
| `network`                    | 최대 2회                | 조회는 반복 가능하며 응답 없는 전송 실패는 빠르게 회복될 수 있음    |
| `timeout`                    | 최대 1회                | 한 번의 실패 자체가 설정된 timeout만큼 걸리므로 총 대기 시간을 제한 |
| HTTP 408                     | 최대 1회                | 재전송 가능성이 있지만 반복 대기는 한 번으로 제한                   |
| HTTP 500, 502, 503, 504      | 최대 1회                | 대표적인 일시적 서버/게이트웨이 실패만 한 번 재시도                 |
| HTTP 429                     | 기본적으로 재시도 안 함 | 제한 시간을 모른 채 즉시 반복하면 rate limit을 악화시킴             |
| `canceled`                   | 안 함                   | 의도적으로 중단한 작업                                              |
| 401, 403, 404와 그 밖의 4xx  | 안 함                   | 같은 요청을 반복해도 인증·권한·요청 내용이 바뀌지 않음              |
| 501과 그 밖의 5xx            | 안 함                   | 구현 부재 등 재시도로 회복된다는 근거가 없음                        |
| `unknown` 또는 비-`ApiError` | 안 함                   | 반복 가능한 전송 실패라는 근거가 없음                               |

408은 서버가 할당된 시간 안에 완전한 요청 메시지를 받지 못했다는 뜻이고 클라이언트가 새 연결로
요청을 반복할 수 있다. 401은 유효한 인증 정보가 없다는 뜻이고, 403은 같은 인증 정보로 자동
반복해서는 안 되며, 404는 리소스가 없거나 존재를 공개하지 않는다는 뜻이다. 500/502/503/504는
각각 내부 오류, 잘못된 게이트웨이 응답, 일시적 서비스 불가, 게이트웨이 timeout을 뜻한다.
[RFC 9110 §15.5.2–15.5.9](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.2),
[RFC 9110 §15.6](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.6)

“최대 2회”는 최초 요청에 더해 두 번 재시도하여 **총 3번 시도**한다는 뜻이고, “최대 1회”는
**총 2번 시도**한다는 뜻이다. TanStack Query의 `retry(failureCount, error)`는 첫 실패에서
`failureCount === 0`으로 호출된다. 따라서 network는 `failureCount < 2`, timeout과 재시도 가능한
HTTP 상태는 `failureCount < 1`일 때만 true를 반환한다. 재시도 중 오류는 `failureReason`에 있고,
마지막 실패에 이르러야 `error`가 된다.
[TanStack Query Query Retries](https://tanstack.com/query/latest/docs/framework/react/guides/query-retries)

이 횟수 차이는 라이브러리 보장이 아니라 현재 Axios timeout 10초를 반영한 앱 정책이다. timeout을
network와 똑같이 두 번 재시도하면 요청 시간만 최대 30초이고 기본 1초·2초 지연까지 합쳐 약 33초가
된다. 한 번으로 제한하면 최대 약 21초다. 반면 network 실패는 응답 timeout까지 기다리지 않고 즉시
실패하는 경우가 많아 한 번 더 회복 기회를 준다.

별도 요구가 없으면 `retryDelay`는 재구현하지 않는다. TanStack Query 기본값은 첫 재시도 전 1초,
두 번째 전 2초처럼 지수 백오프하고 30초에서 상한을 둔다. 실제 구현도
`min(1000 * 2 ** failureCount, 30000)`이다.
[공식 구현](https://github.com/TanStack/query/blob/50680b98c4dc5ac4d97f7762014fa83f09a41d9a/packages/query-core/src/retryer.ts#L35-L56),
[재시도 판단과 지연 순서](https://github.com/TanStack/query/blob/50680b98c4dc5ac4d97f7762014fa83f09a41d9a/packages/query-core/src/retryer.ts#L195-L229)

429 자동 재시도가 제품 요구가 되면 `retryAfterMs`가 정상이고 허용 대기 시간 이내일 때만 한 번
재시도하고 그 지연을 그대로 존중한다. `Retry-After`가 없거나 잘못됐거나 사용자가 기다릴 수 있는
상한을 넘으면 자동 재시도하지 않는다. 이것은 초기 계약에 헤더 파싱을 미리 넣지 않으면서도
rate limit을 맹목적으로 두드리지 않는 결정이다.

## 3. 취소는 오류 복구가 아니라 Query 수명주기다

모든 Query 함수는 TanStack Query가 제공하는 `signal`을 Axios 요청에 그대로 전달한다. Axios 0.22+
역시 `signal`을 지원한다. signal을 실제로 사용한 Query가 취소되면 TanStack Query는 Promise를
취소하고 Query 상태를 이전 상태로 되돌린다.
[TanStack Query Query Cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation),
[Axios Cancellation](https://axios-http.com/docs/cancellation)

```text
Query가 inactive가 되거나 cancelQueries 호출
  -> TanStack Query의 retryer가 자체 CancelledError로 종료
  -> 이전 Query 상태로 revert
  -> AbortController.abort()
  -> Axios가 ERR_CANCELED로 reject
  -> interceptor는 그 Axios 오류를 ApiError("canceled")로 감쌀 수 있음
     그러나 이미 Query 상태를 결정한 것은 TanStack Query의 CancelledError임
```

TanStack Query 구현은 signal이 소비된 Query의 observer가 없어지면 먼저 retryer를
`CancelledError({ revert: true })`로 취소하고, 그 후 AbortController를 abort한다. 그리고
`CancelledError`의 revert 경로는 일반 오류 dispatch 및 `QueryCache.onError`보다 먼저 빠져나간다.
[취소 시작 구현](https://github.com/TanStack/query/blob/50680b98c4dc5ac4d97f7762014fa83f09a41d9a/packages/query-core/src/query.ts#L530-L540),
[취소·revert 구현](https://github.com/TanStack/query/blob/50680b98c4dc5ac4d97f7762014fa83f09a41d9a/packages/query-core/src/query.ts#L725-L810)

따라서 Axios `CanceledError`를 `ApiError("canceled")`로 감싸도 **TanStack Query가 시작한 정상 취소의
revert 의미를 대체하거나 깨도록 사용해서는 안 된다**. 정상 취소 여부는 TanStack Query가 관리한다.
다만 Query 바깥에서 별도 AbortController로 Axios만 취소하면 TanStack Query에는 일반 rejected
Promise인 `ApiError("canceled")`가 도착할 수 있다. 이 경우를 대비해 전역 `retry`, cache callback,
`throwOnError` 모두 `canceled`를 무시한다. Query 함수 안에서 별도 controller를 만들지 않고 전달받은
signal을 사용하는 것이 기본 규칙이다.

## 4. 최종 실패 처리: cache callback과 `throwOnError`

### 호출 시점

`QueryCache.onError`는 매 요청 시도마다 호출되지 않는다. retryer가 더 재시도하지 않기로 결정해
최종 reject한 뒤 Query가 오류 상태를 기록하면서 호출한다. 즉 하나의 Query fetch 주기에서 최종
실패했을 때 한 번이며, 같은 Query를 여러 observer가 보고 있어도 observer마다 반복 호출하는
콜백이 아니다.
[최종 실패 경로](https://github.com/TanStack/query/blob/50680b98c4dc5ac4d97f7762014fa83f09a41d9a/packages/query-core/src/query.ts#L778-L810)

`QueryCache`와 `MutationCache`의 callback은 `QueryClient.defaultOptions`와 달리 개별 Query/Mutation이
덮어쓸 수 없고 항상 호출된다. Query cache callback은 반환 Promise를 기다리지 않는 fire-and-forget,
Mutation cache callback은 반환 Promise를 기다린다.
[QueryCacheConfig](https://tanstack.com/query/latest/docs/framework/react/reference/interfaces/QueryCacheConfig),
[MutationCacheConfig](https://tanstack.com/query/latest/docs/framework/react/reference/interfaces/MutationCacheConfig)

따라서 역할은 다음처럼 고정한다.

| 지점                            | 담당하는 일                                                            | 담당하지 않는 일                        |
| ------------------------------- | ---------------------------------------------------------------------- | --------------------------------------- |
| Query/Mutation `defaultOptions` | retry, networkMode, throwOnError의 기본 정책                           | 반드시 실행돼야 하는 전역 부수 효과     |
| `QueryCache.onError`            | 최종 실패 로깅, 401 세션 만료, cached data가 있는 background 실패 알림 | 재시도 판단, 화면별 403/404 표현        |
| `MutationCache.onError`         | 최종 실패 로깅, 401 세션 만료, 기본 action 실패 알림                   | mutation 자동 재시도, 폼 필드 오류 표현 |
| 개별 화면/Mutation callback     | 기능 맥락이 필요한 복구와 표현                                         | 공통 network/timeout 분기               |

전역 cache callback은 `canceled`를 바로 무시한다. 401은 중복 요청 여러 개가 동시에 실패해도 한 번만
세션을 무효화하도록 인증 상태 전이를 멱등적으로 만든다. 로깅할 때는 `cause.config`의 인증 헤더나
`data` 전체를 그대로 수집하지 않는다.

### Query의 Error Boundary 정책

`throwOnError`는 boolean 또는 `(error, query) => boolean`이며, true이면 오류를 가장 가까운 Error
Boundary로 보낸다. false이면 Query 결과의 `error` 상태로 남긴다.
[UseQueryOptions](https://tanstack.com/query/latest/docs/framework/react/reference/interfaces/UseQueryOptions)

전역 정책은 **캐시된 data가 없고**, 다음 중 하나인 최종 오류만 Boundary로 보낸다.

- `network` 또는 `timeout`
- `unknown` 또는 비-`ApiError`
- 408, 429 또는 5xx HTTP 오류

401은 세션 정책이 처리하므로 Boundary로 보내지 않는다. `canceled`도 보내지 않는다. 408과 429는
기능마다 같은 전송/제한 오류를 반복해서 표현하지 않도록 공통 Boundary가 담당한다. 403, 404와 그
밖의 4xx는 화면이 권한 없음, 찾을 수 없음, 잘못된 입력 등 맥락에 맞게 표현해야 하므로 Query 오류
상태에 남긴다. 캐시된 data가 있는 background refetch 실패는 기존 화면을 유지하고 전역에서 비차단
알림만 한다. TanStack Query의 Suspense 기본 정책도 data가 없을 때만 오류를 throw하고, Boundary
재시도는 `QueryErrorResetBoundary`로 reset하도록 안내한다.
[TanStack Query Suspense와 Error Boundary reset](https://tanstack.com/query/latest/docs/framework/react/guides/suspense#throwonerror-default)

## 5. Mutation은 자동 재시도하지 않는다

Mutation의 전역 `retry`는 `false`/0을 유지한다. TanStack Query 자체도 Mutation 재시도 기본값을
0으로 둔다. [MutationOptions](https://tanstack.com/query/latest/docs/framework/react/reference/interfaces/MutationOptions)

`network`나 `timeout`은 “서버가 작업하지 않았다”는 뜻이 아니다. 클라이언트가 응답을 못 받은 동안
서버는 변경을 완료했을 수 있으므로 POST 같은 작업을 자동 반복하면 중복 생성·결제가 발생할 수
있다. HTTP 명세도 비멱등 메서드는 의미가 실제로 멱등하다는 별도 수단이 없으면 자동 재시도하지
말라고 한다. [RFC 9110 §9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)

예외적으로 API가 idempotency key를 보장하거나 동일 요청의 반복 안전성이 계약과 테스트로 확인된
Mutation만 개별 옵션에서 재시도를 켠다. HTTP 메서드가 PUT/DELETE라는 이유만으로 앱의 전체 동작이
자동으로 안전하다고 추정하지 않는다. 오프라인으로 알려진 상태에서 `networkMode: "online"`인
Mutation이 `paused`되었다가 연결 복구 후 **처음 실행되는 것**은 실패한 요청의 자동 재시도와
구분한다.

Mutation의 최종 오류 표현은 다음과 같다.

- `canceled`: 아무 알림도 하지 않는다.
- 401: 전역 세션 만료 처리만 한다.
- 폼 검증/충돌처럼 화면이 메시지를 알아야 하는 4xx: 개별 Mutation이 필드 또는 화면에 표시한다.
- 그 밖의 최종 실패: `MutationCache.onError`가 기본 action 실패 알림을 한 번 표시한다.
- 심각한 비-`ApiError` 또는 `unknown`: 로깅은 하지만 Mutation을 기본적으로 Error Boundary에 던지지
  않는다. 사용자가 실행한 action의 상태와 재시도 버튼을 현재 화면에 유지한다.

개별 Mutation이 자체 오류 UI를 제공할 때 전역 기본 알림과 중복되지 않도록 예외에만 `meta`로
로컬 표현임을 표시한다. 이 표시는 오류 종류를 매번 분기하게 만드는 것이 아니라 “이 Mutation은
자체 UI가 있다”는 presentation 선택 한 가지다. Mutation cache callback은 항상 실행되므로 callback
자체를 덮어쓰는 방식으로는 전역 처리 생략을 표현할 수 없다.

## 6. 상태별 최종 정책표

| 오류                 | Query retry                | Query 최종 표현                             | 전역 부수 효과               | Mutation retry/표현                 |
| -------------------- | -------------------------- | ------------------------------------------- | ---------------------------- | ----------------------------------- |
| offline 감지         | 요청하지 않고 paused       | 기존/로딩 UI + offline 상태                 | 없음                         | 실행 전 paused                      |
| `network`            | 1초, 2초 간격으로 최대 2회 | data 없으면 Boundary; 있으면 기존 data 유지 | 최종 실패만 로그/비차단 알림 | 자동 retry 없음; action 실패 알림   |
| `timeout`            | 1초 뒤 최대 1회            | data 없으면 Boundary; 있으면 기존 data 유지 | 최종 실패만 로그/비차단 알림 | 자동 retry 없음; 결과 불확실 안내   |
| `canceled`           | 없음                       | 이전 상태로 revert 또는 조용히 종료         | 없음                         | 없음                                |
| HTTP 401             | 없음                       | 인증 화면 전환이 담당                       | 세션 무효화 한 번            | 동일                                |
| HTTP 403             | 없음                       | 기능의 권한 없음 UI                         | 필요 시 로그                 | 자동 retry 없음; 기능 UI            |
| HTTP 404             | 없음                       | 기능의 not-found/absence UI                 | 없음                         | 자동 retry 없음; 기능 UI            |
| HTTP 408             | 최대 1회                   | data 없으면 Boundary; 있으면 기존 data 유지 | 최종 실패 로그/비차단 알림   | 자동 retry 없음                     |
| HTTP 429             | 기본 없음                  | data 없으면 Boundary; 있으면 기존 data 유지 | 최종 실패 로그/비차단 알림   | 자동 retry 없음                     |
| HTTP 500/502/503/504 | 최대 1회                   | data 없으면 Boundary; 있으면 기존 data 유지 | 최종 실패 로그/비차단 알림   | 자동 retry 없음; action 실패 알림   |
| 기타 4xx             | 없음                       | 기능 UI                                     | 필요 시 로그                 | 자동 retry 없음; 기능 UI            |
| 기타 5xx             | 없음                       | data 없으면 Boundary                        | 최종 실패 로그               | 자동 retry 없음; action 실패 알림   |
| `unknown`/일반 Error | 없음                       | data 없으면 Boundary                        | 진단 로그                    | 자동 retry 없음; 진단 + action 실패 |

408과 429는 HTTP 응답을 받은 4xx이지만 요청별 도메인 의미가 아니라 전송 timeout과 rate limit이라는
횡단 정책이므로 공통 Boundary가 처리한다. 403, 404, 409, 422처럼 기능 맥락에 따라 표현이 달라지는
4xx만 Query 오류 상태에 남긴다.

## 7. 구현 시 검증해야 할 시나리오

이 설계를 구현할 때 다음을 테스트로 고정한다.

1. `network`는 `failureCount` 0과 1에서 retry하고 2에서 중단한다. `timeout`과 재시도 가능한 HTTP
   상태는 0에서만 retry하고 1에서 중단한다.
2. 중간 실패에서는 `failureReason`만 바뀌고 `QueryCache.onError`는 호출되지 않으며, 최종 실패에서만
   한 번 호출된다.
3. 처음부터 offline이면 Axios를 호출하지 않고 paused이며, reconnect 후 최초 실행한다.
4. retry 대기 중 offline이 되면 남은 retry가 paused되고 reconnect 후 계속된다.
5. Query의 signal로 Axios를 취소하면 이전 Query 상태로 revert하고 retry, 토스트, Boundary가 모두
   발생하지 않는다.
6. Query 바깥의 Axios 취소가 `ApiError("canceled")`로 도착해도 전역 정책이 무시한다.
7. 401 응답 본문이 비어 있어도 status만으로 세션 만료 처리가 한 번 발생한다.
8. 403/404/422는 retry 또는 전역 Boundary 없이 기능 오류 상태로 남는다.
9. 500/502/503/504는 Query에서만 최대 1회 retry하고 Mutation에서는 retry하지 않는다.
10. cached data가 있는 background refetch 최종 실패는 화면을 Boundary로 교체하지 않는다.
11. 같은 Query를 여러 컴포넌트가 구독해도 최종 실패의 전역 알림이 observer 수만큼 중복되지 않는다.
12. 로컬 오류 UI를 선언한 Mutation은 전역 기본 알림과 중복되지 않는다.

## 출처 기준

TanStack Query의 세부 실행 순서는 2026-09-09 기준 공식 저장소 `main`의 커밋
[`50680b98c4dc5ac4d97f7762014fa83f09a41d9a`](https://github.com/TanStack/query/commit/50680b98c4dc5ac4d97f7762014fa83f09a41d9a)에
고정해 확인했다. Axios 오류 분류는 공식 v1 문서와 공개 오류 코드 계약을 기준으로 했고, HTTP
상태 의미와 멱등성은 IETF의 RFC 9110 및 RFC 6585를 기준으로 했다.
