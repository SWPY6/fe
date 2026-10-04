# SPEC-stock-chart

원본: `docs/SPEC-stock-chart.md` @ 93307f5

## API 계약

프론트엔드에 전달하는 계약이다. 봉투 규칙은 `SPEC-api-response.md`를 따른다. 구현 후에는 Swagger(`/swagger-ui.html`)가 살아 있는 문서다.

### `GET /api/v1/stocks/{stockId}/chart`

| 파라미터   | 위치  | 필수 | 값                                                 | 기본값            |
| ---------- | ----- | ---- | -------------------------------------------------- | ----------------- |
| `stockId`  | path  | O    | 종목 ID, 정수                                      | —                 |
| `from`     | query | X    | 조회 시작일, `YYYY-MM-DD`                          | `to`에서 2개월 전 |
| `to`       | query | X    | 조회 종료일, `YYYY-MM-DD`                          | 오늘              |
| `interval` | query | X    | `1D`(일), `1W`(주), `1M`(월), `3M`(분기), `1Y`(연) | `1D`              |

`from`은 `to`보다 늦을 수 없고, 조회 구간은 5년을 넘을 수 없다.
일봉 이외의 봉은 조회 구간의 일봉을 주·월·분기·연 단위로 합산한다.

화면 동작과의 대응:

| 사용자 동작    | 프론트가 보내는 것                                                                |
| -------------- | --------------------------------------------------------------------------------- |
| 첫 진입(일봉)  | 쿼리 생략 — 기본 구간 2개월 → 일봉 약 40개                                        |
| 첫 진입(월봉)  | `?from=2025-09-30&interval=1M` — 월봉은 기본 구간으로 3개뿐이라 `from`을 명시한다 |
| 줌 아웃        | `from`을 뒤로 민다 — `?from=2021-09-29&interval=1M`                               |
| 줌 인          | `interval`을 좁히고 구간을 줄인다 — `?from=2026-09-01&interval=1D`                |
| 라인↔캔들 전환 | **재요청 없음** (응답에 종가와 OHLC가 다 있다)                                    |
| 장중 갱신      | 같은 요청을 `/quote`와 같은 주기로 폴링 (캐시 공유라 KIS 호출이 늘지 않는다)      |

**200 성공** — 월봉, 장중 (`?from=2026-07-01&to=2026-09-29&interval=1M`, 오늘 2026-09-29)

```json
{
  "data": {
    "stockId": 1,
    "interval": "1M",
    "currency": "KRW",
    "from": "2026-07-01",
    "to": "2026-09-01",
    "asOf": "2026-09-29T14:31:05+09:00",
    "averageVolume": 15595000,
    "candles": [
      {
        "tradeAt": "2026-07-01",
        "open": 238000,
        "high": 241500,
        "low": 237200,
        "close": 240100,
        "volume": 12760000,
        "closed": true
      },
      {
        "tradeAt": "2026-08-03",
        "open": 240500,
        "high": 262300,
        "low": 239800,
        "close": 258900,
        "volume": 18430000,
        "closed": true
      },
      {
        "tradeAt": "2026-09-01",
        "open": 122100,
        "high": 142000,
        "low": 112300,
        "close": 117700,
        "volume": 15982000,
        "closed": false
      }
    ]
  }
}
```

마지막 봉의 `tradeAt`이 `2026-09-01`(9월 첫 거래일)이고 `closed`가 `false`다. 9월 한 달이 진행 중이며 `close`는 현재가, `volume`은 9월 1일부터 오늘까지의 누계다. `to`는 마지막 **봉**의 거래일이므로 오늘이 아니라 `2026-09-01`이다.

`averageVolume`은 확정된 7월·8월 두 봉의 거래량 평균인 `(12,760,000 + 18,430,000) ÷ 2 = 15,595,000`이다. 진행 중인 9월 봉은 평균에서 제외한다.

**200 성공** — 일봉, 장 시작 전 (`?from=2026-09-21&to=2026-09-25&interval=1D`)

```json
{
  "data": {
    "stockId": 1,
    "interval": "1D",
    "currency": "KRW",
    "from": "2026-09-21",
    "to": "2026-09-25",
    "asOf": null,
    "averageVolume": 703252,
    "candles": [
      {
        "tradeAt": "2026-09-21",
        "open": 126700,
        "high": 128100,
        "low": 123500,
        "close": 125600,
        "volume": 387162,
        "closed": true
      },
      {
        "tradeAt": "2026-09-22",
        "open": 130600,
        "high": 136100,
        "low": 125700,
        "close": 131300,
        "volume": 1023754,
        "closed": true
      },
      {
        "tradeAt": "2026-09-23",
        "open": 130000,
        "high": 130000,
        "low": 120200,
        "close": 121100,
        "volume": 1201523,
        "closed": true
      },
      {
        "tradeAt": "2026-09-25",
        "open": 121900,
        "high": 126800,
        "low": 118900,
        "close": 124600,
        "volume": 200570,
        "closed": true
      }
    ]
  }
}
```

확정 봉이 4개뿐이라 `averageVolume`은 4개의 평균이다.
봉 단위가 월봉이면 확정 월봉, 일봉이면 확정 일봉 중 마지막 최대 20개로 계산한다.
확정 봉이 없으면 `averageVolume`은 `null`이다.

조회 구간에 봉이 없으면 `candles`는 `[]`이고 `from`, `to`, `asOf`, `averageVolume`은 모두 `null`이다.

| 필드                | 타입                                       | null | 설명                                                                                                       |
| ------------------- | ------------------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------- |
| `stockId`           | integer                                    | X    | 종목 ID                                                                                                    |
| `interval`          | `"1D"` / `"1W"` / `"1M"` / `"3M"` / `"1Y"` | X    | 적용된 봉 단위. 생략 요청이면 `"1D"` — 선택 상태 표시용                                                    |
| `currency`          | `"KRW"` / `"USD"`                          | X    | 가격 통화                                                                                                  |
| `from`              | string(date)                               | O    | 첫 봉의 거래일. 봉이 없으면 `null`                                                                         |
| `to`                | string(date)                               | O    | 마지막 봉의 거래일. 봉이 없으면 `null`                                                                     |
| `asOf`              | string(ISO-8601, 오프셋 포함)              | O    | 진행 중 봉의 기준 시각. 진행 중 봉이 없으면 `null`                                                         |
| `averageVolume`     | integer                                    | O    | 확정 봉 중 마지막 최대 20개의 평균 거래량 — 거래량 차트 기준선 1개 (RQ-1006·1007). 확정 봉이 없으면 `null` |
| `candles[]`         | array                                      | X    | 거래일 오름차순. 빈 배열 가능                                                                              |
| `candles[].tradeAt` | string(date)                               | X    | 봉에 포함된 첫 거래일. `interval=1D`면 그 거래일                                                           |
| `candles[].open`    | number                                     | X    | 시가 — 봉의 첫 거래일 시가                                                                                 |
| `candles[].high`    | number                                     | X    | 고가 — 봉 구간의 최댓값                                                                                    |
| `candles[].low`     | number                                     | X    | 저가 — 봉 구간의 최솟값                                                                                    |
| `candles[].close`   | number                                     | X    | 종가 — 봉의 마지막 거래일 종가. 진행 중 봉은 현재가. 라인 차트는 이 값만 쓴다 (RQ-1003·1004)               |
| `candles[].volume`  | integer                                    | X    | 거래량(주) — 봉 구간의 합계 (RQ-1006)                                                                      |
| `candles[].closed`  | boolean                                    | X    | `true` 확정 봉, `false` 진행 중 봉(폴링하면 값이 바뀐다)                                                   |

**400 잘못된 봉 단위** (`?interval=2W`)

```json
{
  "error": {
    "name": "InvalidInputValueException",
    "code": "P001",
    "message": "잘못된 입력값입니다."
  }
}
```

5년 구간 상한 초과, 구간 역전(`?from=2026-09-29&to=2026-09-01`), 날짜 형식 오류(`?from=notadate`), 정수가 아닌 `stockId`도 같은 응답이다.

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
