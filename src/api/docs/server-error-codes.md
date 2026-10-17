# 서버 에러 코드

서버가 반환하는 에러 코드의 의미와 실제 발생 조건을 정리한다. 프론트에서 오류 원인을 구분할 때 참고하는 문서이며, 페이지별 ErrorBoundary 범위나 재시도 정책을 확정하는 문서는 아니다.

- 확인일: 2026-10-04
- 기준: [SWPY6/be의 a455b84 커밋](https://github.com/SWPY6/be/tree/a455b84331e5796c7a6686db9af66410b7a22b88)
- 확인 범위: 에러 코드 정의, 공통 예외 처리기, 각 코드의 실제 발생 지점. 운영 서버의 배포 버전과 일치하는지는 확인하지 않았다.

## 응답 형식

서버는 HTTP 상태와 함께 아래 형태의 응답을 반환한다.

```json
{
  "error": {
    "name": "MarketDataUnavailableException",
    "code": "P007",
    "message": "시세 정보를 불러올 수 없습니다."
  }
}
```

`name`, `code`, `message`는 서버의 `ErrorCode` 정의에서 가져온다. 필드 검증 오류에는 `errors: [{ "field": "필드명" }]`이 추가될 수 있으며, 목록이 비어 있으면 `errors` 자체를 생략한다. 구체적인 예외 원인이나 외부 공급자의 원문 오류를 이 응답에 넣지는 않는다.

근거: [ErrorResponse](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/common/response/ErrorResponse.java).

## 코드별 의미

| 코드 | HTTP | 서버 상수                   | 의미와 실제 발생 상황                                                                                                   |
| ---- | ---- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| P001 | 400  | `INVALID_INPUT_VALUE`       | 요청값 오류. 필수값 누락, 타입·enum 불일치, 잘못된 JSON, 필드 검증 실패, 지원하지 않는 차트 간격, 잘못된 조회 기간 등.  |
| P002 | 404  | `STOCK_NOT_FOUND`           | 요청한 `stockId`에 해당하는 종목이 서버 DB에 없음.                                                                      |
| P003 | 404  | `RESOURCE_NOT_FOUND`        | 요청 경로·리소스를 찾지 못함. 잘못된 URL이나 제공하지 않는 API 경로 등에서 발생.                                        |
| P004 | 405  | `METHOD_NOT_ALLOWED`        | 해당 경로에서 지원하지 않는 HTTP 메서드로 요청함.                                                                       |
| P005 | 415  | `UNSUPPORTED_MEDIA_TYPE`    | 서버가 지원하지 않는 `Content-Type`으로 요청함.                                                                         |
| P006 | 500  | `INTERNAL_SERVER_ERROR`     | 다른 처리기에 분류되지 않은 서버 예외. 구체적인 원인은 서버 로그에 기록됨.                                              |
| P007 | 502  | `MARKET_DATA_UNAVAILABLE`   | 시세 제공 불가. KIS 호출·토큰 발급·응답 오류, 시세 Redis 접근 실패, 캐시가 채워지기를 기다리다 실패한 경우 등을 포함.   |
| P008 | 502  | `NEWS_UNAVAILABLE`          | 뉴스 조회·응답 처리 실패. 네이버 뉴스 호출·인증·통신 오류, 빈 응답, 파싱 실패, 응답 항목 전체를 사용할 수 없는 경우 등. |
| P009 | 503  | `NEWS_QUOTA_EXCEEDED`       | 뉴스 조회 제한. 네이버 429, 서버 자체의 일일 호출 한도 초과, 뉴스 캐시·호출량 관리용 Redis 장애를 포함.                 |
| P010 | 502  | `DISCLOSURE_UNAVAILABLE`    | 공시 조회·응답 처리 실패. DART·SEC 호출·인증·접근·통신 오류, 빈 응답, 응답 처리 실패 등.                                |
| P011 | 503  | `DISCLOSURE_QUOTA_EXCEEDED` | 공시 조회 제한. 외부·자체 호출 한도, DART 점검, Redis 장애, 법인 매핑이 아직 준비되지 않은 상태 등을 포함.              |

HTTP 상태와 상수의 기준은 [ErrorCode](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/common/exception/ErrorCode.java)다. P001·P003~P006의 공통 변환은 [GlobalExceptionHandler](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/common/exception/GlobalExceptionHandler.java)에서 확인할 수 있다. `BusinessException`은 자신이 가진 `ErrorCode`의 상태와 내용을 그대로 응답한다.

## 실제 발생 조건과 해석

### P001의 입력 오류 범위

입력 오류에는 사용자가 입력한 값뿐 아니라 프론트가 구성한 요청값의 오류도 포함된다. 공통 예외 처리 외에 다음 조건에서 직접 P001을 발생시킨다.

- 차트: `from`이 `to`보다 늦거나 조회 기간이 5년을 초과함. 지원하지 않는 `interval`도 P001이다.
- 뉴스: `from`·`to` 중 하나만 전달, 시작이 종료보다 앞서지 않음, 종료가 미래, 조회 기간이 7일 초과.
- 공시: 뉴스와 같은 기간 검증을 적용하되 최대 기간은 90일.
- 종목 기본정보·공시 컨트롤러: `stockId`가 0 이하.

근거: [ChartRange](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/stock/chart/ChartRange.java#L27), [ChartInterval](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/stock/chart/ChartInterval.java#L39), [NewsWindow](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/news/NewsWindow.java#L21), [DisclosureWindow](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/disclosure/DisclosureWindow.java#L26), [StockSummaryController](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/stock/summary/controller/StockSummaryController.java#L55), [StockDisclosureController](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/disclosure/controller/StockDisclosureController.java#L87).

### P002와 P003의 차이

P002는 종목 조회 과정에서 DB에 해당 종목이 없을 때 발생한다. P003는 Spring의 `NoResourceFoundException`을 변환한 코드다. 두 코드 모두 HTTP 404지만, P003를 종목 없음이나 검색 결과 없음으로 해석할 근거는 없다.

근거: [JpaStockReader](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/stock/service/JpaStockReader.java#L23), [GlobalExceptionHandler](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/common/exception/GlobalExceptionHandler.java#L34).

### P007에 포함되는 시세 장애

P007은 시세를 제공하지 못했다는 분류다. KIS가 실패 응답을 보낸 경우뿐 아니라 토큰 발급 실패, 필수 응답값 누락, Redis 접근 실패, 다른 요청이 캐시를 채우기를 기다리다가 실패한 경우도 같은 코드로 반환한다. 프론트는 P007만으로 공급자 장애와 캐시 장애를 구분할 수 없다.

근거: [RestClientKisApiClient](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/external/kis/RestClientKisApiClient.java#L43), [CachedKisAccessTokenProvider](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/external/kis/auth/CachedKisAccessTokenProvider.java#L62), [KisNumbers](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/external/kis/KisNumbers.java#L28), [RedisQuoteCache](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/stock/quote/redis/RedisQuoteCache.java#L122), [StockQuoteService](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/stock/quote/service/StockQuoteService.java#L79).

### P008과 P010의 조회 실패

P008·P010은 뉴스·공시 공급자 호출이나 응답 처리에 실패했다는 뜻이다. 조회 결과가 0건이라는 뜻이 아니다. 외부 공급자의 인증 오류 역시 서버가 공급자에 접근하지 못한 상황이므로, 이 코드로 사용자에게 서비스 로그인을 요구할 근거는 없다.

네이버 뉴스, DART, SEC 호출은 외부 서버 오류·연결 오류에 대해 서버 내부에서 한 번 재시도한다. 같은 유형의 실패가 두 시도 모두 발생하면 각각 P008 또는 P010을 반환한다. 재시도도 호출 한도를 검사하므로, 그 과정에서 제한에 걸리면 P009 또는 P011이 반환될 수 있다. 모든 실패 원인에 재시도를 적용하는 것은 아니다.

근거: [NaverNewsProvider](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/news/naver/NaverNewsProvider.java#L63), [DartFetcher](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/disclosure/dart/DartFetcher.java#L58), [SecFetcher](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/disclosure/sec/SecFetcher.java#L33).

### P009와 P011의 조회 제한

상수 이름에는 `QUOTA_EXCEEDED`가 들어 있지만, 실제 발생 범위는 호출 한도 초과보다 넓다.

- P009: 네이버 429, 서버 자체 일일 한도, 뉴스 캐시·호출량 관리용 Redis 접근 실패.
- P011: DART·SEC 429, 서버 자체 호출 한도, DART 상태 `020` 또는 점검 상태 `800`, 공시 캐시·호출량·법인 매핑 Redis 접근 실패.
- P011: 법인 매핑 데이터가 없는 상태에서 다른 요청이 갱신 중이거나 직전 실패로 갱신 잠금이 남아 있는 경우도 포함한다.

호출량을 확인할 수 없는 Redis 장애에서는 외부 요청이 무제한으로 나가지 않도록 조회를 제한한다. 따라서 P009·P011만으로 특정 사용자의 한도 초과라고 단정하거나, 정확한 복구 시각을 안내할 수 없다.

근거: [RedisNewsCallBudget](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/news/redis/RedisNewsCallBudget.java#L22), [RedisNewsCache](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/news/redis/RedisNewsCache.java#L71), [DartStatus](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/disclosure/dart/DartStatus.java#L24), [RedisDisclosureCache](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/disclosure/redis/RedisDisclosureCache.java#L70), [RedisDartCallBudget](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/disclosure/redis/RedisDartCallBudget.java#L45), [RedisSecCallBudget](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/disclosure/redis/RedisSecCallBudget.java#L39), [RedisIssuerCodes](https://github.com/SWPY6/be/blob/a455b84331e5796c7a6686db9af66410b7a22b88/src/main/java/com/swyp/ploutos/disclosure/redis/RedisIssuerCodes.java#L73).

## 프론트 정책을 정할 때의 적용 범위

에러 코드는 실패 원인의 분류다. 어떤 화면을 대체할지, 메시지를 어떻게 표현할지, 재시도 버튼을 제공할지는 요청한 API와 화면의 역할을 함께 보고 별도로 정해야 한다.

같은 HTTP 상태라도 코드의 의미가 다르며, 같은 코드도 여러 내부 원인을 포함한다. 이 문서의 코드 정의만으로 페이지 전체 오류 전환이나 일괄 재시도 정책을 결정하지 않는다.
