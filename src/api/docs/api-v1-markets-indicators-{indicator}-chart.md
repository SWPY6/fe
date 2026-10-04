# SPEC-market-chart

원본: `docs/SPEC-market-chart.md` @ ebd1229
갱신 시각: 2026-10-04 15:19 KST

## API 계약

프론트엔드에 전달하는 계약이다.

- 봉투 규칙은 `SPEC-api-response.md`를 따른다.
- 구현 후에는 Swagger(`/swagger-ui.html`)가 살아 있는 문서다.

### `GET /api/v1/markets/indicators/{indicator}/chart`

| 파라미터    | 위치  | 필수 | 값                                                                                                |
| ----------- | ----- | ---- | ------------------------------------------------------------------------------------------------- |
| `indicator` | path  | O    | `KOSPI` / `KOSDAQ` / `NASDAQ` / `SP500` / `USD_KRW` (대문자). 카드 API의 `indicators[].indicator` |
| `from`      | query | X    | `yyyy-MM-dd`. 생략하면 `to` − 2개월                                                               |
| `to`        | query | X    | `yyyy-MM-dd`. 생략하면 지표 타임존의 오늘                                                         |
| `interval`  | query | X    | `1D` / `1W` / `1M` / `3M` / `1Y`. 생략하면 `1D`                                                   |

화면 동작과의 대응은 `SPEC-stock-chart.md`와 같다. 확대·축소는 재요청이고, 라인↔칤들 전환은 재요청하지 않는다. 장중 갱신은 카드와 같은 10초 주기로 폴링한다.

**200 성공: KOSPI 일봉, 장중** (`GET /api/v1/markets/indicators/KOSPI/chart?from=2026-09-28`, 한국 시간 2026-09-30 10:15)

9/28·9/29는 실측값이다. 9/30 진행 중인 봉의 값은 예시다.

```json
{
  "data": {
    "indicator": "KOSPI",
    "name": "코스피",
    "unit": "POINT",
    "interval": "1D",
    "from": "2026-09-28",
    "to": "2026-09-30",
    "asOf": "2026-09-30T10:15:03+09:00",
    "candles": [
      {
        "tradeAt": "2026-09-28",
        "open": 7057.86,
        "high": 7065.9,
        "low": 6889.68,
        "close": 6889.74,
        "closed": true
      },
      {
        "tradeAt": "2026-09-29",
        "open": 6844.41,
        "high": 6898.36,
        "low": 6782.99,
        "close": 6870.81,
        "closed": true
      },
      {
        "tradeAt": "2026-09-30",
        "open": 6875.2,
        "high": 6910.45,
        "low": 6861.02,
        "close": 6902.33,
        "closed": false
      }
    ]
  }
}
```

마지막 봉이 진행 중이다(`closed: false`). `close`는 현재값이고, 폴링하면 값이 바뀜다.

**200 성공: NASDAQ 일봉, 진행 중인 봉 없음** (`GET /api/v1/markets/indicators/NASDAQ/chart?from=2026-09-28`, 한국 시간 2026-09-30 14:00 = 뉴욕 9/30 01:00)

모두 실측값이다.

```json
{
  "data": {
    "indicator": "NASDAQ",
    "name": "나스닥",
    "unit": "POINT",
    "interval": "1D",
    "from": "2026-09-28",
    "to": "2026-09-29",
    "asOf": null,
    "candles": [
      {
        "tradeAt": "2026-09-28",
        "open": 26935.76,
        "high": 26990.02,
        "low": 26709.69,
        "close": 26820.38,
        "closed": true
      },
      {
        "tradeAt": "2026-09-29",
        "open": 26908.76,
        "high": 26919.01,
        "low": 26717.95,
        "close": 26797.54,
        "closed": true
      }
    ]
  }
}
```

뉴욕은 이미 9/30이지만 현재값은 9/29 장의 것이다. 현재값의 전일 종가(26820.38, 9/28 종가)가 마지막 확정 봉(9/29) 종가와 다르므로 진행 중인 봉을 붙이지 않는다(조건 2). `asOf`는 `null`이다.

**200 성공: 원/달러 월봉** (`GET /api/v1/markets/indicators/USD_KRW/chart?from=2026-07-01&interval=1M`)

값은 예시다. 환율은 소수 넷째 자리로 저장되지만 둘째 자리로 반올림해 내보낸다.

```json
{
  "data": {
    "indicator": "USD_KRW",
    "name": "원/달러 환율",
    "unit": "KRW",
    "interval": "1M",
    "from": "2026-07-01",
    "to": "2026-09-01",
    "asOf": "2026-09-30T10:15:04+09:00",
    "candles": [
      {
        "tradeAt": "2026-07-01",
        "open": 1382.5,
        "high": 1401.2,
        "low": 1371.3,
        "close": 1389.1,
        "closed": true
      },
      {
        "tradeAt": "2026-08-03",
        "open": 1388.0,
        "high": 1395.4,
        "low": 1360.8,
        "close": 1366.7,
        "closed": true
      },
      {
        "tradeAt": "2026-09-01",
        "open": 1367.2,
        "high": 1380.0,
        "low": 1348.6,
        "close": 1354.0,
        "closed": false
      }
    ]
  }
}
```

**봉이 없을 때** (예: 5년보다 오래된 구간을 KIS가 주지 않는 경우): `candles: []`이고 `from`, `to`, `asOf`는 `null`이다.

| 필드                | 타입                                       | null | 설명                                                                  |
| ------------------- | ------------------------------------------ | ---- | --------------------------------------------------------------------- |
| `indicator`         | string                                     | X    | 지표 식별자. 요청 경로의 값                                           |
| `name`              | string                                     | X    | 한글 표시명                                                           |
| `unit`              | `"POINT"` / `"KRW"`                        | X    | 가격 단위. **값이 늘어날 수 있다** (유가는 `USD`)                     |
| `interval`          | `"1D"` / `"1W"` / `"1M"` / `"3M"` / `"1Y"` | X    | 적용된 봉 단위. 생략 요청이면 `"1D"`                                  |
| `from`              | string (date)                              | O    | 첫 봉의 거래일. 봉이 없으면 `null`                                    |
| `to`                | string (date)                              | O    | 마지막 봉의 거래일. 봉이 없으면 `null`                                |
| `asOf`              | string (ISO-8601, 오프셋 포함)             | O    | 진행 중인 봉의 기준 시각. 진행 중인 봉이 없으면 `null`                |
| `candles[]`         | array                                      | X    | 거래일 오름차순. 빈 배열 가능                                         |
| `candles[].tradeAt` | string (date)                              | X    | 봉에 포함된 첫 거래일                                                 |
| `candles[].open`    | number                                     | X    | 시가. 소수 둘째 자리                                                  |
| `candles[].high`    | number                                     | X    | 고가. 소수 둘째 자리                                                  |
| `candles[].low`     | number                                     | X    | 저가. 소수 둘째 자리                                                  |
| `candles[].close`   | number                                     | X    | 종가. 진행 중인 봉은 현재값. 라인 차트는 이 값만 쓴다. 소수 둘째 자리 |
| `candles[].closed`  | boolean                                    | X    | `true`는 확정 봉, `false`는 진행 중인 봉                              |

주식 차트 응답과의 차이: `stockId`, `currency`, `averageVolume`, `candles[].volume`이 없다. 대신 `indicator`, `name`, `unit`이 있다.

**400 잘못된 지표** (`/api/v1/markets/indicators/DOW/chart`, `/api/v1/markets/indicators/kospi/chart`)

```json
{
  "error": {
    "name": "InvalidInputValueException",
    "code": "P001",
    "message": "잘못된 입력값입니다."
  }
}
```

**400 잘못된 봉 단위·날짜·구간**: 같은 응답이다. 예: `?interval=2W`, `?from=notadate`, `?from=2026-09-29&to=2026-09-01`(역전), `?from=2015-01-01`(5년 초과).

```json
{
  "error": {
    "name": "InvalidInputValueException",
    "code": "P001",
    "message": "잘못된 입력값입니다."
  }
}
```

**502 시세 제공자 오류**: 일봉 동기화나 현재값 조회 중 KIS 실패, Redis 접근 불가, 첫 조회 대기 초과.

```json
{
  "error": {
    "name": "MarketDataUnavailableException",
    "code": "P007",
    "message": "시세 정보를 불러올 수 없습니다."
  }
}
```

**500 서버 내부 오류**: 예상하지 못한 예외다.

```json
{
  "error": {
    "name": "InternalServerErrorException",
    "code": "P006",
    "message": "서버 내부 오류가 발생했습니다."
  }
}
```

| 상황                                         | HTTP | 코드   |
| -------------------------------------------- | ---- | ------ |
| `indicator`가 허용된 값이 아님 (소문자 포함) | 400  | `P001` |
| `interval`이 허용된 값이 아님                | 400  | `P001` |
| `from`·`to` 형식 오류                        | 400  | `P001` |
| `from`이 `to`보다 뒤                         | 400  | `P001` |
| 구간이 5년 초과                              | 400  | `P001` |
| 일봉·현재값 조회 실패                        | 502  | `P007` |
| 그 밖의 예외                                 | 500  | `P006` |
