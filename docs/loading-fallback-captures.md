# 로딩 fallback 캡처

시장 개요 3개 영역, 산업 목록, 종목 상세 6개 영역에 로딩 UI를 연결했다. 기존 ErrorBoundary의 props·오류 fallback, 쿼리 옵션과 loader는 변경하지 않았다.

`boneyard-js@1.10.0`의 공식 `snapshotBones`로 2026-10-06에 다음 공개 화면의 조회가 끝난 DOM을 추출했다. 좌표와 크기는 수동 작성하거나 보정하지 않았다.

- [시장 개요](https://ploutos-2vw.pages.dev/?market=domestic): 산업 흐름, 시장 지표, 산업별 이슈
- [산업 목록](https://ploutos-2vw.pages.dev/industries?filter=ALL&market=domestic): 산업 9개
- [종목 상세](https://ploutos-2vw.pages.dev/stocks/9035?market=domestic&from=2026-09-06&to=2026-10-06&interval=1D): 한화솔루션 요약·시세·차트·지표, 뉴스 20건, 공시 8건

각 JSON은 실제 CSS viewport 너비 375/640/768/1024/1280에서 캡처한 결과를 공식 `breakpoints` 형식으로 보관한다. 640/768/1024/1280은 프로젝트의 Tailwind sm/md/lg/xl 기준이다. 각 boundary는 `select="viewport"`를 사용한다. 실측 맵은 자동 식별자로 이관해 앱 진입점에서 registry로 등록한다. 아래 출처의 기존 좌표와 크기는 유지했다.

375 캡처는 일반 브라우저 확대 200% 상태에서 실제 `window.innerWidth === 375`를 확인한 뒤 추출했다. 나머지 너비는 일반 창 크기 조절로 맞췄다. JSON 좌표는 공식 함수가 반환한 CSS 픽셀 기준이며 수동 축소하지 않았다. JSON의 `viewportWidth` 필드는 대상 요소 너비이므로 상위 breakpoint 키와 다를 수 있다.

- 앱의 고정 영역 크기는 기존 부모 DOM이 정한다. 이미 있던 차트 `h-96`은 부모 한 곳에만 두고 자식은 그 영역을 채운다.
- 종목 요약·시세의 기존 부모 div는 로딩 중(`aria-busy`)에만 해당 breakpoint의 실측 너비를 예약한다. 완료 후에는 원래의 내용 기반 너비로 돌아가며, 자식 fallback은 부모 너비를 채운다.
- boneyard 자체의 DOM 측정 및 생성된 높이에 따른 intrinsic sizing은 라이브러리 동작 그대로 사용한다.
- 캡처는 해당 데이터의 대표 형상이며, breakpoint 사이 줄바꿈이나 다른 응답 건수의 높이까지 같다고 보장하지 않는다. 산업별 이슈는 실제 관련 뉴스 없음 상태이고 시장 지표 차트는 기존 `차트 준비 중` 상태다.
- 원본 캡처 당시에는 변경된 개발 빌드의 브라우저 렌더링과 로딩 중 resize·재조회 흐름을 검증하지 못했다. 이번 자동 registry 이관 검증 범위는 아래와 같다.

추출에 사용한 `dist/extract.js`의 SHA-256은 `e3607f3dca0e98523e2f65bd6ebfb3444257c5d1016e761543b0d5cf861beeab`이다.

## 자동 식별자와 재캡처

컴포넌트에서는 `boneyard-js/react`의 `BoneSuspense`를 named import해서 사용한다. `name`, `initialBones`, JSON import, 별도 표식이나 wrapper는 추가하지 않는다. 별칭 named import도 지원한다. 경계 props spread는 자동 식별자를 덮어쓸 수 있어 빌드에서 거부한다.

`scripts/boneyard.ts`의 Vite pre-transform은 저장소 상대 파일 경로와 파일 내 BoneSuspense 소스 등장 번호의 SHA-256 앞 16자리를 사용한다. 줄 번호, 절대 경로, 날짜, 렌더 횟수에는 의존하지 않는다. 공백이나 경계 내부 UI 수정은 ID를 유지한다. 파일 이동·경계 추가/삭제/순서 변경은 ID를 바꿀 수 있으므로 재캡처한다. 새 ID의 실측 파일이 없으면 production 빌드는 실패한다.

플러그인은 TanStack Router의 reference/virtual split 처리와 React 변환보다 먼저 실행된다. query suffix를 제외한 원본 상대 경로로 개발·캡처·production에서 같은 ID를 만든다. React 6/Vite 8의 JSX 변환은 그대로 사용한다.

공식 Vite 캡처 플러그인은 serve 전용이고, 준비되지 않은 DOM이나 숨겨진 탭도 저장할 수 있다. 따라서 이름 주입은 별도 공통 pre-transform으로, 캡처·responsive JSON·registry 생성은 [공식 CLI](https://boneyard.vercel.app/cli)로 실행한다. 플러그인의 자동 HMR 캡처는 켜지 않는다.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm bones:capture
```

이 명령은 저장소의 실제 API proxy 설정으로 127.0.0.1:5174 개발 서버를 잠시 시작한다. 먼저 기본 종목 9035의 실제 API 응답과 이름을 확인한다. 유효하지 않으면 `BONEYARD_STOCK_ID=<유효한 국내 종목 ID> pnpm bones:capture`로 지정한다. 기간은 실행일 기준 최근 30일이다. MSW는 허용하지 않는다. 시스템 Chromium을 쓰려면 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`을 지정할 수 있다.

홈, 산업 목록, 종목 상세를 375/640/768/1024/1280px로 캡처한다. 공시 탭은 별도 브라우저 방문에서 실제 탭 컨트롤을 클릭한다. 공식 CLI의 network-idle 대기와 추가 2초 대기 후 추출하고, 숨겨진 forceMount 패널의 0 크기 결과는 제외한다. API 실패·브라우저 오류·빈 결과·누락된 ID/너비가 있으면 실패하며 기존 산출물을 교체하지 않는다. 검증된 임시 맵을 공식 CLI가 registry로 합친 후 `src/components/ui/bones`를 교체한다. 스켈레톤별 경로·이름·import 목록은 수동 관리하지 않는다.

요약·시세의 기존 부모 className은 그대로다. 기존 CSS 변수는 실측 `width`에서 생성한 `widths.css`가 공식 `data-boneyard`/`aria-busy`를 통해 부모에 제공한다. 새 부모 DOM, 높이, viewport store를 추가하지 않는다. 차트의 기존 `h-full`은 공식 캡처 모드의 내부 div까지 전달하도록 `*:h-full`을 사용한다. 부모의 `h-96`이 계속 높이를 정하고 일반 완료 상태에는 이 캡처 wrapper가 없다. capture 명령이 이 CSS도 갱신한다.

UI 수정 후 `pnpm bones:capture`를 다시 실행하고 출력의 변경된 map 수와 `git diff -- src/components/ui/bones`를 확인한다. 생성된 JSON/registry/CSS/provenance는 함께 커밋한다. 원래 CLI 출력 포맷을 보존하기 위해 생성 디렉터리는 oxfmt 대상에서 제외한다.

## 이번 환경에서의 검증

- 실제 Vite 개발 서버와 production preview에서 10개 자동 ID와 registry 스켈레톤을 확인했다. API 요청을 대기시킨 상태에서 다섯 너비의 실측 맵 선택, 공시 탭 전환, 새 콘솔/페이지 오류 없음을 확인했다. 성공 응답은 만들지 않았다.
- 요약·시세 부모 너비는 기존 캡처의 너비를 유지하고, 차트 부모와 fallback은 모든 너비에서 384px였다.
- 원본 10개 JSON과 이관본은 `name` 외 모든 필드가 동일하다. 실제 transform은 체크아웃 절대 경로, serve/build 모드, Router query suffix, 공백, 내부 텍스트 변경에 같은 ID를 반환했다.
- typecheck, lint, format:check, production build를 실행했다. 새 테스트 파일은 추가하지 않았다.

### 실제 데이터 재캡처 한계

새 캡처 명령은 구성된 백엔드 `ploutosbe.duckdns.org`의 DNS 실패로 종목 API HTTP 502에서 중단되었다. 정상 응답을 만든 fixture나 mock은 사용하지 않았다. 따라서 현재 산출물은 새 캡처가 아니라 아래 원본의 이름만 바꾼 이관본이다. 실제 데이터의 새 캡처 성공, UI 변경 후 재캡처 산출물 변경은 API 접근 가능한 환경에서 추가 확인해야 한다.

## 이관 출처

원본 commit: `f2a4afd205faea5f4bd822a52d274c86bdbb4c19`. 아래 SHA-256은 원본 JSON 바이트 기준이다. 모든 breakpoint의 `name` 외 필드는 원본과 동일하다. registry는 이관 시 한 번 생성했고, 이후에는 공식 CLI가 생성한다.

| 자동 ID                 | 원본 파일                                                                     | 원본 SHA-256                                                       |
| ----------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `bone_48d69c0f327d9f67` | `src/routes/_layout/(root)/-components/market-summary.bones.json`             | `9f5f0fceeb9ef286216b8ce8bb01cf503d84c255fdb54b5c777b5e22e121a134` |
| `bone_9c5bde0e98598415` | `src/routes/_layout/(root)/-components/industry-issues.bones.json`            | `a5f350377502762eb574b84c340c55ea1093820098128d0a8d86317a365d4293` |
| `bone_4789128a6dbd856e` | `src/routes/_layout/industries/-industry-list.bones.json`                     | `2bff228480a4ba28670be5816c3566becc2f2dbfa7665b8145019cc03c8de2f3` |
| `bone_4ed59d358bb548b0` | `src/routes/_layout/(root)/-components/industry-flow.bones.json`              | `f79bb81f30686270570d73eba5191673e06ca449946cb2500acae3300ac901be` |
| `bone_52bab78f86dd397e` | `src/routes/_layout/stocks/$stockId/-components/stock-summary.bones.json`     | `ab6e09ccd87441b6527db3fd44cf0874c89063e6f1f025c5fb67a9750e81694b` |
| `bone_fac1c2be10a2ab18` | `src/routes/_layout/stocks/$stockId/-components/stock-quote.bones.json`       | `34a7b56a5377a91e958110ee69584dac9aadc35bcbaf40af512f97280c2f4888` |
| `bone_12a6aae9fc8c3bff` | `src/routes/_layout/stocks/$stockId/-components/stock-chart.bones.json`       | `e4e7b548a8bc5e4336b703fd1e44d88a3d18466f5f9b83e92ef0c29e5466e460` |
| `bone_040de5356bee2a96` | `src/routes/_layout/stocks/$stockId/-components/stock-indicators.bones.json`  | `3b100666f73392b1cf09c8796c3816c5339642191c1838cf21ef40c4da93c65d` |
| `bone_421cd65178fdc48d` | `src/routes/_layout/stocks/$stockId/-components/stock-news.bones.json`        | `a8fbf0ee9f0a92ad332dca280c5c8932b0c3f649bfe45e7104d4c61d44e16f63` |
| `bone_304e3dca9ca2fbe5` | `src/routes/_layout/stocks/$stockId/-components/stock-disclosures.bones.json` | `63527aaf9083fca7ba11ef04b6aabd21d87c1c626376ec3ccd4275ed27697a5d` |
