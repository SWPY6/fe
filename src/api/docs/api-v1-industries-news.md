# SPEC-industry-news

원본: `docs/SPEC-industry-news.md` @ ebd1229
갱신 시각: 2026-10-04 15:13 KST

## API 계약

프론트엔드에 전달하는 계약이다. 봉투 규칙은 `SPEC-api-response.md`를 따른다.

구현 후에는 Swagger(`/swagger-ui.html`)가 살아 있는 문서다.

### `GET /api/v1/industries/news?country=KR`

요청: 쿼리 `country` ∈ `KR` / `US`, 생략 시 `KR`. 화면의 시장 토글과 같다.

**200 성공**

```json
{
  "data": [
    {
      "code": "AUTOMOBILE",
      "displayName": "자동차",
      "direction": "RISING",
      "rank": 1,
      "avgChangeRate": 1.61,
      "stockCount": 4,
      "risingCount": 3,
      "fallingCount": 1,
      "news": [
        {
          "title": "자동차 수출 증가 발표",
          "publisher": "산업통상자원부",
          "publishedAt": "2026-09-04T09:00:00+09:00",
          "url": "https://example.com/news/1"
        }
      ],
      "calculatedAt": "2026-09-04T15:30:00+09:00"
    },
    {
      "code": "CHEMICAL",
      "displayName": "화학",
      "direction": "FALLING",
      "rank": 9,
      "avgChangeRate": -0.35,
      "stockCount": 4,
      "risingCount": 2,
      "fallingCount": 2,
      "news": [],
      "calculatedAt": "2026-09-04T15:30:00+09:00"
    }
  ]
}
```

| 필드                 | 타입   | null  | 설명                                                                                                                       |
| -------------------- | ------ | ----- | -------------------------------------------------------------------------------------------------------------------------- |
| `code`               | string | X     | 산업 코드. `industryId`는 노출하지 않는다                                                                                  |
| `displayName`        | string | X     | 한글 표시명                                                                                                                |
| `direction`          | string | X     | `RISING`(상승 카드) 또는 `FALLING`(하락 카드)                                                                              |
| `rank`               | number | X     | 9개 중 등락률 순위. 1부터. 선정 순서와 무관하다                                                                            |
| `avgChangeRate`      | number | X     | 평균 등락률 %. 직전 거래일 종가 대비                                                                                       |
| `stockCount`         | number | X     | 평균에 반영된 종목 수                                                                                                      |
| `risingCount`        | number | X     | 그중 상승 종목 수                                                                                                          |
| `fallingCount`       | number | X     | 그중 하락 종목 수                                                                                                          |
| `news`               | array  | X     | 관련 뉴스. 없으면 `[]`. **1건** (가장 최근). 배열인 이유는 0건일 때 `[]`로 표현하고 늘릴 때 계약이 안 바뀜게 하기 위해서다 |
| `news[].title`       | string | X     | 제목                                                                                                                       |
| `news[].publisher`   | string | X     | 출처                                                                                                                       |
| `news[].publishedAt` | string | X     | 발표 시각. 시장 현지 오프셋                                                                                                |
| `news[].url`         | string | X     | 원문 링크                                                                                                                  |
| `calculatedAt`       | string | **O** | 계산 시각. 시장 현지 오프셋. 계산된 적 없으면 `null`                                                                       |

배열은 항상 길이 2이며 `[RISING, FALLING]` 순이다. 대체 선정이 있어도 길이는 변하지 않는다.

**거래대금 변화율은 응답에 넣지 않는다.** 화면이 표시하지 않기 때문이다. 선정 관문으로만 쓰이며

`industry_flows`에 저장된다. RQ-0401의 수용 기준은 "거래대금 변화율이 한 카드에 표시된다"이고

목업 프로토타입에도 `거래대금 20일 평균 대비 +52.65%` 줄이 있지만, 실제 디자인에 없다는 확인을

받아 제외했다. 표시가 필요해지면 `IndustryNewsResponse`에 필드 한 줄을 더하면 된다 —

값은 이미 저장돼 있다.

**선정 근거(`selectedBy`)도 응답에 넣지 않는다.** 화면이 "거래대금 증가가 함께 나타난 경우"와

"등락률 기준"을 구분해 표시하지 않기 때문이다. 도메인(`IndustryCard.selectedBy`)에는 남겨

선정 규칙 테스트가 대체 경로를 검증한다 — 뿑힌 산업이 같을 때 두 경로를 구분할 길이

이 값뿐이다. 화면이 구분하게 되면 필드 한 줄을 더하면 된다.

### 오류

| 상황                         | HTTP | 코드   |
| ---------------------------- | ---- | ------ |
| `country`가 허용되지 않은 값 | 400  | `P001` |

산업이 하나도 없는 경우는 발생하지 않는다 — 시드가 9행을 보장한다.
