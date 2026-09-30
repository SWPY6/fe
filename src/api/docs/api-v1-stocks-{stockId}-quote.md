# SPEC-stock-quote

원본: `docs/SPEC-stock-quote.md` @ 17a461c
갱신 시각: 2026-09-30 14:44 KST

## API 계약

프론트엔드에 전달하는 계약이다. 봉투 규칙은 `SPEC-api-response.md`를 따른다. 구현 후에는 Swagger(`/swagger-ui.html`)가 살아 있는 문서다.

### `GET /api/v1/stocks/{stockId}/quote`

요청: 경로 변수 `stockId`(정수). 쿼리 없음. 권장 폴링 주기 10초(캐시 TTL과 동일).

**200 성공**

```json
{
  "data": {
    "stockId": 1,
    "ticker": "005380",
    "name": "현대차",
    "currency": "KRW",
    "price": 248000,
    "change": 7783,
    "changeRate": 3.24,
    "priceAt": "2026-08-12T14:31:05+09:00",
    "priceTiming": "REALTIME",
    "indicators": {
      "previousClose": 240217,
      "open": 244280,
      "high": 251224,
      "low": 241056,
      "volume": 245000,
      "volumeRatio20d": 0.95,
      "marketCap": 86600000000000,
      "tradingValue": 60800000000
    }
  }
}
```

| 필드                        | 타입                          | null | 설명                                                                                                             |
| --------------------------- | ----------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------- |
| `stockId`                   | integer                       | X    | 종목 ID                                                                                                          |
| `ticker`                    | string                        | X    | 종목 코드 (`005380`, `AAPL`)                                                                                     |
| `name`                      | string                        | X    | 종목명                                                                                                           |
| `currency`                  | "KRW" / "USD"                 | X    | 아래 모든 금액의 통화. 표기(원/달러, 조·억 축약)는 프론트                                                        |
| `price`                     | number                        | X    | 현재가 (RQ-1001)                                                                                                 |
| `change`                    | number                        | X    | 직전 정규장 종가 대비 등락폭. 음수 가능                                                                          |
| `changeRate`                | number                        | X    | 등락률 %, 소수 둘째 자리 (RQ-1001)                                                                               |
| `priceAt`                   | string(ISO-8601, 오프셋 포함) | X    | 가격 기준 시각 = 서버가 시세를 받은 시각. 캐시 응답이면 최대 TTL만큼 과거 (RQ-1001)                              |
| `priceTiming`               | "REALTIME" / "DELAYED"        | X    | 실시간·지연 여부 (RQ-1001)                                                                                       |
| `indicators.previousClose`  | number                        | X    | 전일 종가 (RQ-1008)                                                                                              |
| `indicators.open`           | number                        | X    | 당일 시가                                                                                                        |
| `indicators.high`           | number                        | X    | 당일 고가                                                                                                        |
| `indicators.low`            | number                        | X    | 당일 저가                                                                                                        |
| `indicators.volume`         | integer                       | X    | 당일 누적 거래량(주)                                                                                             |
| `indicators.volumeRatio20d` | number                        | O    | 당일 거래량 ÷ 최근 20거래일 평균 거래량, 소수 둘째 자리. 거래일 20일 미만이면 `null` ("평소 거래량 대비 0.95배") |
| `indicators.marketCap`      | number                        | X    | 시가총액, `currency` 기본 단위(원·달러)                                                                          |
| `indicators.tradingValue`   | number                        | X    | 당일 누적 거래대금, `currency` 기본 단위                                                                         |

**400 `stockId`가 정수가 아님** (`GET /api/v1/stocks/abc/quote`)

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

**502 시세 제공자 오류** (KIS 토큰 실패·응답 코드 오류·HTTP 오류·타임아웃)

```json
{
  "error": {
    "name": "MarketDataUnavailableException",
    "code": "P007",
    "message": "시세 정보를 불러올 수 없습니다."
  }
}
```
