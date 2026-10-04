# SPEC-industry-flow

원본: `docs/SPEC-industry-flow.md` @ 25347a3
갱신 시각: 2026-10-04 15:13 KST

## API 계약

프론트엔드에 전달하는 계약이다. 봉투 규칙은 `SPEC-api-response.md`를 따른다.

### `GET /api/v1/industries/flows`

| 파라미터  | 필수 | 값          | 설명                             |
| --------- | ---- | ----------- | -------------------------------- |
| `country` | X    | `KR` / `US` | 기본 `KR`. 화면의 국내·해외 토글 |

**200 성공**

```json
{
  "data": [
    {
      "code": "AUTOMOBILE",
      "displayName": "자동차",
      "rank": 1,
      "avgChangeRate": 1.61,
      "stockCount": 87,
      "majorStocks": [
        { "stockId": 10, "ticker": "005380", "name": "현대차", "changeRate": 3.24 },
        { "stockId": 30, "ticker": "000270", "name": "기아", "changeRate": 1.85 }
      ],
      "calculatedAt": "2026-09-28T10:00:07+09:00"
    },
    {
      "code": "CONSTRUCTION",
      "displayName": "건설",
      "rank": 2,
      "avgChangeRate": 0.45,
      "stockCount": 94,
      "majorStocks": [
        { "stockId": 60, "ticker": "000720", "name": "현대건설", "changeRate": 1.68 },
        { "stockId": 61, "ticker": "047040", "name": "대우건설", "changeRate": 0.49 }
      ],
      "calculatedAt": "2026-09-28T10:00:07+09:00"
    }
  ]
}
```

| 필드                       | 타입                          | null  | 설명                                                                                                       |
| -------------------------- | ----------------------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| `code`                     | string                        | X     | 산업 코드. `"AUTOMOBILE"` 등 9종. **산업 식별자로 이 값을 쓴다**                                           |
| `displayName`              | string                        | X     | 한글 산업명. `"자동차"`                                                                                    |
| `rank`                     | integer                       | X     | 평균 등락률 순위. 1이 가장 높다 (RQ-0201)                                                                  |
| `avgChangeRate`            | number                        | X     | 평균 등락률 %, 소수 둘째 자리. 음수 가능                                                                   |
| `stockCount`               | integer                       | X     | **평균에 실제로 반영된** 종목 수. 0일 수 있다                                                              |
| `majorStocks`              | array                         | X     | 시가총액 상위 대표 종목. **0~2개.** 빈 배열일 수 있다                                                      |
| `majorStocks[].stockId`    | integer                       | X     | 종목 식별자. 종목 상세·현재가·차트 조회에 이 값을 쓴다                                                     |
| `majorStocks[].ticker`     | string                        | X     | 종목 코드 (`005380`, `TSLA`). 화면 표시용                                                                  |
| `majorStocks[].name`       | string                        | X     | 종목명. 계산 시점의 값                                                                                     |
| `majorStocks[].changeRate` | number                        | X     | 그 종목의 등락률 %, 소수 둘째 자리                                                                         |
| `calculatedAt`             | string(ISO-8601, 오프셋 포함) | **O** | 이 산업의 값이 계산된 시각(시장 현지). 한 번도 계산되지 않았으면 `null` — 과거 시차는 한 바퀴 시간만큼이다 |

`majorStocks`를 배열로 두면 종목이 0·1개인 산업도 같은 형태로 표현되고, 나중에 4개로 늘릴 때 프론트 계약이 깨지지 않는다.

`majorStocks[].stockId`는 종목 상세로 이동하는 데 쓴다. 종목 API가 `/api/v1/stocks/{stockId}`로 `stockId`를 받고 `ticker`로 조회하는 경로가 없어서, 이 값이 없으면 카드의 종목을 눌러도 이동할 수 없다. 산업은 `code`라는 안정된 외부 식별자가 있어 `industryId`를 숨길 수 있지만 종목에는 그런 대안이 없다.

배열은 항상 **9개**이며 `rank` 오름차순으로 정렬돼 있다. 다만 `rank`는 값이므로 프론트는 배열 인덱스가 아니라 이 필드를 써야 한다 — 관심 산업 고정이 들어오면 둘이 어긋난다. `industryId`는 내려주지 않는다 — `auto_increment` 값이라 환경마다 다를 수 있다.

**400 `country`가 `KR`·`US`가 아님**

```json
{
  "error": {
    "name": "InvalidInputValueException",
    "code": "P001",
    "message": "잘못된 입력값입니다."
  }
}
```

**계산이 한 번도 실행되지 않은 경우** 빈 배열(`{"data": []}`)이 아니라 9개 산업을 `avgChangeRate: 0`, `stockCount: 0`, `majorStocks: []`로 응답한다. 프론트가 카드 9장을 그대로 그릴 수 있게 한다.
