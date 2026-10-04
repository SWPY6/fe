# SPEC-market-summary

원본: `docs/SPEC-market-summary.md` @ ebd1229
갱신 시각: 2026-10-04 15:13 KST

## API 계약

프론트엔드에 전달하는 계약이다.

- 봉투 규칙은 `SPEC-api-response.md`를 따른다.
- 구현 후에는 Swagger(`/swagger-ui.html`)가 살아 있는 문서다.
- 예시의 숫자는 2026-09-30 KIS 실측값이다.

### `GET /api/v1/markets/summary?region={region}`

| 파라미터 | 위치  | 필수 | 값                                              |
| -------- | ----- | ---- | ----------------------------------------------- |
| `region` | query | O    | `DOMESTIC` / `OVERSEAS` (대문자, 대소문자 구분) |

권장 폴링 주기는 10초다. `market-quote` 캐시 TTL과 같다.

**200 성공: 국내 탭** (`GET /api/v1/markets/summary?region=DOMESTIC`)

```json
{
  "data": {
    "region": "DOMESTIC",
    "indicators": [
      {
        "indicator": "KOSPI",
        "name": "코스피",
        "unit": "POINT",
        "value": 6870.81,
        "change": -18.93,
        "changeRate": -0.27,
        "valueAt": "2026-09-30T14:31:05+09:00"
      },
      {
        "indicator": "KOSDAQ",
        "name": "코스닥",
        "unit": "POINT",
        "value": 849.8,
        "change": 3.22,
        "changeRate": 0.38,
        "valueAt": "2026-09-30T14:31:05+09:00"
      },
      {
        "indicator": "USD_KRW",
        "name": "원/달러 환율",
        "unit": "KRW",
        "value": 1354.0,
        "change": -5.9,
        "changeRate": -0.43,
        "valueAt": "2026-09-30T14:31:06+09:00"
      }
    ]
  }
}
```

**200 성공: 해외 탭** (`GET /api/v1/markets/summary?region=OVERSEAS`)

```json
{
  "data": {
    "region": "OVERSEAS",
    "indicators": [
      {
        "indicator": "NASDAQ",
        "name": "나스닥",
        "unit": "POINT",
        "value": 26817.3,
        "change": -3.08,
        "changeRate": -0.01,
        "valueAt": "2026-09-30T01:31:05-04:00"
      },
      {
        "indicator": "SP500",
        "name": "S&P 500",
        "unit": "POINT",
        "value": 7675.05,
        "change": -8.64,
        "changeRate": -0.11,
        "valueAt": "2026-09-30T01:31:05-04:00"
      },
      {
        "indicator": "USD_KRW",
        "name": "원/달러 환율",
        "unit": "KRW",
        "value": 1354.0,
        "change": -5.9,
        "changeRate": -0.43,
        "valueAt": "2026-09-30T14:31:06+09:00"
      }
    ]
  }
}
```

| 필드                      | 타입                           | null | 설명                                                                                                                                                                                       |
| ------------------------- | ------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `region`                  | `"DOMESTIC"` / `"OVERSEAS"`    | X    | 요청한 탭                                                                                                                                                                                  |
| `indicators`              | array                          | X    | 탭의 지표 카드. 표시 순서대로 온다. 프론트는 받은 순서 그대로 그린다                                                                                                                       |
| `indicators[].indicator`  | string                         | X    | 지표 식별자. `KOSPI` / `KOSDAQ` / `NASDAQ` / `SP500` / `USD_KRW`. 차트 API 경로에 그대로 쓴다. **값이 늘어날 수 있다** (유가 추가 예정). 모르는 값도 `name`과 `unit`으로 그릴 수 있게 한다 |
| `indicators[].name`       | string                         | X    | 한글 표시명                                                                                                                                                                                |
| `indicators[].unit`       | `"POINT"` / `"KRW"`            | X    | `value`와 `change`의 단위. 지수는 포인트, 환율은 1달러당 원. **값이 늘어날 수 있다** (유가는 `USD`)                                                                                        |
| `indicators[].value`      | number                         | X    | 현재값. 소수 둘째 자리                                                                                                                                                                     |
| `indicators[].change`     | number                         | X    | 직전 거래일 종가 대비 등락폭. 소수 둘째 자리. 음수 가능                                                                                                                                    |
| `indicators[].changeRate` | number                         | X    | 등락률 %. 소수 둘째 자리. 음수 가능                                                                                                                                                        |
| `indicators[].valueAt`    | string (ISO-8601, 오프셋 포함) | X    | 값의 기준 시각 = 서버가 KIS에서 받은 시각. 국내 지수와 환율은 `+09:00`, 해외 지수는 뉴욕 시간(`-04:00`/`-05:00`). 최대 10초(캐시 TTL) 전 값일 수 있다                                      |

- 환율 카드는 두 탭에서 같은 값이다. 같은 캐시 키를 쓴다.
- 해외 지수의 `valueAt`은 미국 날짜다. 한국 시간 새벽에는 국내 카드와 날짜가 다르게 보인다.

**400 `region` 누락** (`GET /api/v1/markets/summary`)

```json
{
  "error": {
    "name": "InvalidInputValueException",
    "code": "P001",
    "message": "잘못된 입력값입니다."
  }
}
```

**400 `region` 값이 잘못됨** (`?region=KOREA`, `?region=domestic`)

```json
{
  "error": {
    "name": "InvalidInputValueException",
    "code": "P001",
    "message": "잘못된 입력값입니다."
  }
}
```

**502 시세 제공자 오류**: 탭의 지표 중 하나라도 시세를 얻지 못한 경우다. 원인은 KIS 실패(토큰, 응답 코드, HTTP 오류, 타임아웃), Redis 접근 불가, 첫 조회 대기(3초) 초과다.

```json
{
  "error": {
    "name": "MarketDataUnavailableException",
    "code": "P007",
    "message": "시세 정보를 불러올 수 없습니다."
  }
}
```

**500 서버 내부 오류**: 예상하지 못한 예외다. 원인은 서버 로그에만 남는다.

```json
{
  "error": {
    "name": "InternalServerErrorException",
    "code": "P006",
    "message": "서버 내부 오류가 발생했습니다."
  }
}
```

| 상황                                                  | HTTP | 코드   |
| ----------------------------------------------------- | ---- | ------ |
| `region` 누락                                         | 400  | `P001` |
| `region`이 `DOMESTIC`/`OVERSEAS`가 아님 (소문자 포함) | 400  | `P001` |
| 지표 하나라도 시세 조회 실패                          | 502  | `P007` |
| 그 밖의 예외                                          | 500  | `P006` |
