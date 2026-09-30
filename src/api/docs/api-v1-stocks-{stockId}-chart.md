# SPEC-stock-chart

원본: `docs/SPEC-stock-chart.md` @ 17a461c
갱신 시각: 2026-09-30 14:44 KST

## API 계약

프론트엔드에 전달하는 계약이다. 봉투 규칙은 `SPEC-api-response.md`를 따른다. 구현 후에는 Swagger(`/swagger-ui.html`)가 살아 있는 문서다.

### `GET /api/v1/stocks/{stockId}/chart?period=3M`

요청: 경로 변수 `stockId`(정수). 쿼리 `period` ∈ `1M` | `3M` | `6M` | `1Y`, 생략 시 `1M`. 라인/캐들 전환·확대·축소·기간 초기화는 이 응답 하나로 프론트가 처리한다 — 기간이 바뀌을 때만 재요청한다. 장중에 당일 봉을 갱신하려면 `/quote`와 같은 주기로 폴링해도 된다(캐시를 공유하므로 KIS 호출이 늘지 않는다).

**200 성공** (장중, 당일 봉 포함)

```json
{
  "data": {
    "stockId": 1,
    "period": "3M",
    "currency": "KRW",
    "from": "2026-05-12",
    "to": "2026-08-12",
    "asOf": "2026-08-12T14:31:05+09:00",
    "averageVolume20d": 84210,
    "candles": [
      {
        "tradeAt": "2026-05-12",
        "open": 244280,
        "high": 251224,
        "low": 241056,
        "close": 248000,
        "volume": 245000,
        "closed": true
      },
      {
        "tradeAt": "2026-05-13",
        "open": 248500,
        "high": 249900,
        "low": 246100,
        "close": 247300,
        "volume": 198000,
        "closed": true
      },
      {
        "tradeAt": "2026-08-12",
        "open": 244280,
        "high": 251224,
        "low": 241056,
        "close": 248000,
        "volume": 245000,
        "closed": false
      }
    ]
  }
}
```

**200 성공** (장 시작 전·휴장일, 당일 봉 없음)

```json
{
  "data": {
    "stockId": 1,
    "period": "1M",
    "currency": "KRW",
    "from": "2026-07-13",
    "to": "2026-08-11",
    "asOf": null,
    "averageVolume20d": 84210,
    "candles": [
      {
        "tradeAt": "2026-07-13",
        "open": 238000,
        "high": 241500,
        "low": 237200,
        "close": 240100,
        "volume": 176000,
        "closed": true
      },
      {
        "tradeAt": "2026-08-11",
        "open": 239800,
        "high": 241000,
        "low": 238900,
        "close": 240217,
        "volume": 201000,
        "closed": true
      }
    ]
  }
}
```

| 필드                | 타입                          | null | 설명                                                                                                  |
| ------------------- | ----------------------------- | ---- | ----------------------------------------------------------------------------------------------------- |
| `stockId`           | integer                       | X    | 종목 ID                                                                                               |
| `period`            | string                        | X    | 적용된 기간. 생략 요청이면 `"1M"` — 선택 상태 표시용 (RQ-1002)                                        |
| `currency`          | "KRW" / "USD"                 | X    | 가격 통화                                                                                             |
| `from`              | string(date)                  | O    | 첫 봉의 거래일. 봉이 없으면 `null`                                                                    |
| `to`                | string(date)                  | O    | 마지막 봉의 거래일. 당일 봉이 있으면 오늘. 봉이 없으면 `null`                                         |
| `asOf`              | string(ISO-8601, 오프셋 포함) | O    | 당일 봉의 기준 시각. 당일 봉이 없으면 `null`                                                          |
| `averageVolume20d`  | integer                       | O    | 최근 20거래일 평균 거래량(확정 봉 기준) — 거래량 차트 기준선 1개 (RQ-1006·1007). 20일 미만이면 `null` |
| `candles[]`         | array                         | X    | 거래일 오름차순. 거래일이 아닌 날은 없다. 빈 배열 가능                                                |
| `candles[].tradeAt` | string(date)                  | X    | 거래일                                                                                                |
| `candles[].open`    | number                        | X    | 시가                                                                                                  |
| `candles[].high`    | number                        | X    | 고가                                                                                                  |
| `candles[].low`     | number                        | X    | 저가                                                                                                  |
| `candles[].close`   | number                        | X    | 종가. 라인 차트는 이 값만 쓴다 (RQ-1003·1004). 당일 봉은 현재가                                       |
| `candles[].volume`  | integer                       | X    | 거래량(주) — 거래량 막대 (RQ-1006). 당일 봉은 누적 거래량                                             |
| `candles[].closed`  | boolean                       | X    | `true` 확정 봉, `false` 당일 진행 중 봉(폴링하면 값이 바뀀다)                                         |

**400 잘못된 기간** (`?period=2W`)

```json
{
  "error": {
    "name": "InvalidInputValueException",
    "code": "P001",
    "message": "잘못된 입력값입니다."
  }
}
```

**404 없는 종목**

```json
{
  "error": {
    "name": "StockNotFoundException",
    "code": "P002",
    "message": "주식을 찾을 수 없습니다."
  }
}
```

**502 시세 제공자 오류** (일봉 동기화 또는 현재가 조회 중 KIS 실패)

```json
{
  "error": {
    "name": "MarketDataUnavailableException",
    "code": "P007",
    "message": "시세 정보를 불러올 수 없습니다."
  }
}
```
