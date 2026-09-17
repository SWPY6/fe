# Pretendard font 실험 기록

## 공통 측정 조건

| 항목           | 조건                          |
| -------------- | ----------------------------- |
| 실행 대상      | Production build              |
| 실행 서버      | Vite preview                  |
| Browser        | Chromium                      |
| 측정 방식      | Chrome DevTools Protocol      |
| Viewport       | 1280 × 900                    |
| Network        | 10Mbps download, 40ms latency |
| Browser cache  | Disabled                      |
| Service worker | Blocked                       |
| 반복 횟수      | 각 구성 5회                   |
| 결과값         | 5회 Median                    |

각 실행마다 새 browser context를 만들었다. 동시에 여러 페이지를 측정하면 제한된 network bandwidth를
나눠 쓰게 되므로 각 구성은 순서대로 측정했다.

측정값은 다음 기준으로 수집했다.

- `Font requests`: 전송이 끝난 WOFF2 요청 수
- `Font transfer`: 전송된 WOFF2 용량 합계
- `Font ready`: navigation 시작부터 `document.fonts.ready`까지 걸린 시간
- `CSS transfer`: 전송된 CSS 용량 합계
- `Total transfer`: HTML, CSS, JavaScript, WOFF2를 포함한 전체 응답 용량
- `LCP`: Largest Contentful Paint
- `CLS`: Cumulative Layout Shift

## 실험 1. Variable full과 Variable dynamic subset 비교

모든 구성에서 같은 문구와 weight 400, 500, 700, 900을 사용했다. `Variable full`은
`PretendardVariable.woff2` 하나를 preload했고, `Variable dynamic subset`은 font preload 없이
92개 chunk 중 화면의 문자에 필요한 파일만 요청하도록 구성했다.

| 구성                    | Font requests | Font transfer | Font ready |   LCP | CLS |
| ----------------------- | ------------: | ------------: | ---------: | ----: | --: |
| Variable full + preload |             1 |     2,009.8KB |    1,724ms | 216ms |   0 |
| Variable dynamic subset |            12 |       306.1KB |      422ms | 120ms |   0 |

측정값 차이:

- Font requests: 1개 → 12개
- Font transfer: 2,009.8KB → 306.1KB, 1,703.7KB 감소
- Font ready: 1,724ms → 422ms, 1,302ms 단축
- LCP: 216ms → 120ms, 96ms 단축
- CLS: 두 구성 모두 0

`Variable full`에만 preload가 포함돼 있으므로 font 파일 구성만 분리한 비교는 아니다. 다만 full
WOFF2의 요청을 먼저 시작한 조건에서도 Font transfer와 Font ready는 `Variable dynamic subset`보다
크고 느렸다.

## 실험 2. `subset.91` preload 비교

`Variable dynamic subset`에서 실제로 요청되는 파일 하나를 preload했을 때의 변화를 확인했다.
`subset.91`은 비교 화면의 영문, 숫자와 일부 한글을 포함하므로 preload가 없는 구성에서도 요청되는
파일이다.

두 구성의 차이는 다음 preload 태그 한 개뿐이다.

```html
<link
  rel="preload"
  href="/fonts/pretendard/v1.3.9/woff2-dynamic-subset/PretendardVariable.subset.91.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

| 구성                | Font requests | Font transfer | Font ready |   LCP | CLS |
| ------------------- | ------------: | ------------: | ---------: | ----: | --: |
| Preload 없음        |            12 |       306.1KB |      422ms | 120ms |   0 |
| `subset.91` preload |            12 |       306.1KB |      401ms | 152ms |   0 |

측정값 차이:

- Font requests: 두 구성 모두 12개
- Font transfer: 두 구성 모두 306.1KB
- Font ready: 422ms → 401ms, 21ms 단축
- LCP: 120ms → 152ms, 32ms 증가
- CLS: 두 구성 모두 0

preload 요청의 중복 여부도 확인했다. `subset.91`은 preload와 CSS에서 각각 요청되지 않고 하나의 font
request로 재사용됐다.

LCP 증가 원인을 확인하기 위해 다음 대조 실험을 추가했다.

| 확인 항목                         | 결과                                                |
| --------------------------------- | --------------------------------------------------- |
| LCP element                       | 모든 구성에서 첫 번째 한국어 font sample 문단       |
| Preload 없음, 마지막 순서 재측정  | LCP 약 124ms                                        |
| 사용하지 않는 `subset.12` preload | LCP 약 156ms                                        |
| `subset.91` preload               | DCL 약 116ms, font 응답 완료 약 134ms, LCP 약 152ms |

사용하지 않는 `subset.12`에서도 비슷한 LCP 증가가 발생했고, preload가 없는 구성을 마지막 순서에서
다시 측정했을 때는 기존 결과와 비슷했다. 따라서 `subset.91`의 glyph 내용이나 구성 측정 순서가 LCP
차이를 만든 것은 아니었다. 이 조건에서는 초기 font preload 요청이 추가될 때 첫 paint 시점이
늦어졌다.

## 실험 3. Variable dynamic subset과 Static dynamic subset 비교

한두 개 weight만 사용하는 화면에 유리한 결과를 피하기 위해 header, hero, 본문, weight sample과
card를 포함한 동일한 화면을 사용했다. 화면에는 한국어 문장, 영문 대문자, 숫자와 weight 400, 500,
600, 700, 900이 포함됐다. 두 구성 모두 font preload는 사용하지 않았다.

| 구성                    | Font requests | Font transfer | CSS transfer | Total transfer | Font ready |   LCP |   FCP | CLS |     DCL |
| ----------------------- | ------------: | ------------: | -----------: | -------------: | ---------: | ----: | ----: | --: | ------: |
| Variable dynamic subset |            14 |       358.2KB |       20.8KB |        483.5KB |    584.3ms | 244ms | 244ms |   0 | 160.2ms |
| Static dynamic subset   |            36 |       433.6KB |      128.4KB |        666.4KB |    819.2ms | 356ms | 356ms |   0 |   244ms |

측정값 차이:

- Font requests: 36개 → 14개, 22개 감소
- Font transfer: 433.6KB → 358.2KB, 75.4KB 감소
- CSS transfer: 128.4KB → 20.8KB, 107.6KB 감소
- Total transfer: 666.4KB → 483.5KB, 182.9KB 감소
- Font ready: 819.2ms → 584.3ms, 234.9ms 단축
- LCP: 356ms → 244ms, 112ms 단축
- FCP: 356ms → 244ms, 112ms 단축
- CLS: 두 구성 모두 0

`Static dynamic subset`에서 요청된 파일은 화면에서 사용한 Regular 400, Medium 500, SemiBold 600,
Bold 700, Black 900에 한정됐다. 사용하지 않은 weight의 WOFF2는 요청되지 않았다.

요청 수 차이는 각 chunk에 들어 있는 weight 정보에서 발생했다. `Variable dynamic subset`의 WOFF2는
각각 `45–920` 범위를 지원한다. 같은 문자를 400과 700으로 표시해도 그 문자가 포함된 WOFF2 하나만
요청한다. `Static dynamic subset`은 같은 glyph range를 weight별 파일로 나누므로 Regular용과
Bold용 WOFF2를 각각 요청한다.

CSS 크기 차이는 `@font-face` 개수에서 발생했다. `Variable dynamic subset` CSS에는 92개,
`Static dynamic subset` CSS에는 9 weights × 92 chunks인 828개의 `@font-face`가 포함됐다.
