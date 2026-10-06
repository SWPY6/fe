# 종목 상세 로딩 캡처

이번 변경은 종목 상세의 차트와 주요 지표 두 영역에만 적용한다. 종목 요약·시세·뉴스·공시와 기존 ErrorBoundary의 props·오류 fallback은 변경하지 않았다.

`boneyard-js@1.10.0`의 공식 `snapshotBones`로 [종목 상세 화면](https://ploutos-2vw.pages.dev/stocks/9035?market=domestic&from=2026-09-06&to=2026-10-06&interval=1D)의 조회가 끝난 DOM을 2026-10-06에 추출했다. 좌표와 크기는 수동 작성하거나 보정하지 않았다.

각 JSON은 실제 CSS viewport 너비 375/640/768/1024/1280에서 캡처한 결과를 공식 `breakpoints` 형식으로 보관한다. 640/768/1024/1280은 프로젝트의 Tailwind sm/md/lg/xl 기준이다. 각 boundary는 `select="viewport"`와 `initialBones`를 사용하므로 전역 registry가 필요하지 않다.

375 캡처는 일반 브라우저 확대 200% 상태에서 실제 `window.innerWidth === 375`를 확인한 뒤 추출했다. 나머지 너비는 일반 창 크기 조절로 맞췄다. JSON 좌표는 공식 함수가 반환한 CSS 픽셀 기준이며 수동 축소하지 않았다. JSON의 `viewportWidth` 필드는 대상 요소 너비이므로 상위 breakpoint 키와 다를 수 있다.

- 앱의 고정 영역 크기는 기존 부모 DOM이 정한다. 이미 있던 차트 `h-96`은 부모 한 곳에만 두고 로딩·완료·빈 결과의 자식은 그 영역을 채운다.
- boneyard 자체의 DOM 측정 및 생성된 높이에 따른 intrinsic sizing은 라이브러리 동작 그대로 사용한다.
- 캡처는 해당 데이터의 대표 형상이며, breakpoint 사이 줄바꿈이나 다른 응답 건수의 높이까지 같다고 보장하지 않는다.
- 변경된 개발 빌드의 브라우저 렌더링과 로딩 중 resize·재조회 흐름은 검증하지 못했다.

추출에 사용한 `dist/extract.js`의 SHA-256은 `e3607f3dca0e98523e2f65bd6ebfb3444257c5d1016e761543b0d5cf861beeab`이다.
