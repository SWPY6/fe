# SPEC-industry-trend

원본: `docs/SPEC-industry-trend.md` @ 25347a3
갱신 시각: 2026-10-04 15:19 KST

## API 계약

### `GET /api/v1/industries/trends?country=KR`

| 파라미터  | 타입                         | 필수 | 기본값 | 설명                                   |
| --------- | ---------------------------- | ---- | ------ | -------------------------------------- |
| `country` | `KR` / `US`                  | X    | `KR`   | 화면의 시장 토글                       |
| `filter`  | `ALL` / `RISING` / `FALLING` | X    | `ALL`  | 화면의 탭. 거르고 정렬까지 서버가 한다 |

**응답** — `ApiResult<List<IndustryTrendResponse>>`. 정렬까지 끝난 목록이다.

| `filter`  | 길이              |
| --------- | ----------------- |
| `ALL`     | **항상 9**        |
| `RISING`  | 0~9 (오른 산업만) |
| `FALLING` | 0~9 (내린 산업만) |

전 산업이 오른 날 `FALLING`은 **빈 배열**이다. 보합(등락률 정확히 `0`)인 산업은 `RISING`·`FALLING` 어디에도 없고 `ALL`에만 나오므로, 두 탭의 길이 합이 9보다 작을 수 있다.

| 필드                  | 타입   | null  | 설명                                                                                 |
| --------------------- | ------ | ----- | ------------------------------------------------------------------------------------ |
| `code`                | string | X     | 산업 코드. 식별자로 이 값을 쓴다 (`"AUTOMOBILE"`)                                    |
| `displayName`         | string | X     | 한글 산업명 (`"자동차"`)                                                             |
| `rank`                | number | X     | 9개 전체 기준 평균 등락률 순위 1~9. `filter`와 무관하다 — 배열 인덱스로 세면 안 된다 |
| `avgChangeRate`       | number | X     | 소속 종목 등락률의 단순평균 %, 소수 둘째 자리                                        |
| `stockCount`          | number | X     | 평균에 실제로 반영된 종목 수                                                         |
| `currency`            | string | X     | `KRW` \                                                                              |
| `stocks`              | array  | X     | 시가총액 상위 **0~4개**. 빈 배열일 수 있다                                           |
| `stocks[].stockId`    | number | X     | 종목 식별자. 종목 상세·현재가·차트 조회에 이 값을 쓴다                               |
| `stocks[].ticker`     | string | X     | 종목 코드 (`"005380"`). 화면 표시용                                                  |
| `stocks[].name`       | string | X     | 종목명. 계산 시점의 값                                                               |
| `stocks[].price`      | number | X     | 현재가                                                                               |
| `stocks[].changeRate` | number | X     | 그 종목의 등락률 %, 소수 둘째 자리                                                   |
| `calculatedAt`        | string | **O** | 계산 시각(시장 현지, 오프셋 포함). 계산된 적 없으면 `null`                           |

```json
{
  "data": [
    {
      "code": "AUTOMOBILE",
      "displayName": "자동차",
      "rank": 1,
      "avgChangeRate": 1.61,
      "stockCount": 4,
      "currency": "KRW",
      "stocks": [
        {
          "stockId": 10,
          "ticker": "005380",
          "name": "현대차",
          "price": 248000,
          "changeRate": 3.24
        },
        {
          "stockId": 20,
          "ticker": "012330",
          "name": "현대모비스",
          "price": 254500,
          "changeRate": -0.78
        },
        { "stockId": 30, "ticker": "000270", "name": "기아", "price": 102000, "changeRate": 1.85 },
        {
          "stockId": 40,
          "ticker": "018880",
          "name": "한온시스템",
          "price": 4320,
          "changeRate": 2.13
        }
      ],
      "calculatedAt": "2026-09-04T15:30:00+09:00"
    }
  ]
}
```

**`stockId`를 응답에 넣는다.** 종목 API가 `/api/v1/stocks/{stockId}`와 그 아래 `/quote`·`/chart`까지 모두 `stockId`를 경로 변수로 받고, `ticker`로 조회하는 경로는 없다. `ticker`만 주면 프론트가 종목 상세로 이동할 수 없다.

auto_increment 값이라 환경마다 다를 수 있는 것은 사실이므로 **프론트는 이 값을 저장하거나 URL에 영구 보관하지 않고 그 화면에서 이동용으로만 쓴다.** `ticker`는 화면에 종목 코드를 표시하는 용도로 함께 남긴다. `/flows`의 `majorStocks`도 같이 바꾼다 — 두 탭의 카드가 같은 동작을 해야 한다.

**프론트가 하는 일**

- 탭을 누르면 `filter`를 바꿔 다시 요청한다. **정렬은 하지 않는다**
- 고정한 산업을 앞으로 당긴다. **`rank`는 건드리지 않는다**
- 통화 기호·부호·`%` 조립

### 오류

| 상황                                       | 상태 | 코드   |
| ------------------------------------------ | ---- | ------ |
| `country`가 `KR`·`US`가 아님               | 400  | `P001` |
| `filter`가 `ALL`·`RISING`·`FALLING`이 아님 | 400  | `P001` |

폴링 주기는 **10초**를 권장한다(`/flows`와 같다).
