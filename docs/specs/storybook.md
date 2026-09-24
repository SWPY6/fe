# Storybook 확장 요구사항

## 현재 상태

Storybook은 이미 설치되어 있고 .storybook/main.ts, .storybook/preview.ts, 실행/빌드 scripts, ChangeRate 및 RelatedArticleCard stories가 존재합니다. 다시 초기화하거나 같은 패키지를 중복 설치하지 말고 기존 설정을 점검해 확장합니다.

## 기준

- 설치 시점의 공식 문서에서 TanStack Router/React/Vite 버전 호환성을 확인합니다. 프로젝트에는 @storybook/tanstack-react 통합이 이미 있습니다.
- stories glob은 기존 .storybook/main.ts 설정을 보존하고, 신규 컴포넌트 stories를 수집하는지 확인합니다.
- preview의 src/index.css 연결 및 public 자산 설정을 보존합니다.
- alias, Tailwind, Pretendard 폰트가 적용되는지 확인하되 앱 전체 router/API/QueryClient를 불필요하게 부팅하지 않습니다.
- package scripts와 lockfile은 기존 설정을 유지하고 실제 누락만 고칩니다.

## 스토리 기준

기존 ChangeRate와 RelatedArticleCard stories를 보존하고 다음 신규 UI의 stories를 추가합니다.

- Header: 기본, 검색 입력, 알림/인증 액션 표시
- PrimaryNavigation: 각 항목 선택 상태, 키보드 상태
- PageHeading/Breadcrumb: 페이지 경로와 제목
- MarketSelector/MarketContext: 국내(KRW)와 해외(USD) 선택
- DataTimestamp/DemoNotice/PrototypeDisclaimer: 표준 표시, 긴 문구, 시각/출처 안내
- MarketIndexCard/MarketSnapshot: 상승·하락·보합, 지수와 환율/원유 단위
- IndustryCarousel: 산업별 내용, 이전/다음, 자동 전환 상태, 정지, 고정, 경계/빈 상태
- IndexChart/ChartControls: 1개월/3개월/6개월/1년, 차트 모양, 확대/축소/초기화, 데이터 없음
- KeyNewsList/RelatedArticleCard: 상승/하락 요약, 뉴스/공시, 선정 근거, 긴 콘텐츠
- MoversTable: 국내/해외 fixtures, 정렬 전/후, 페이지 이동, 빈 행, 긴 종목명, 가로 폭

복합 UI는 CSF args/Controls 중심으로 작성합니다. 사용자가 눌러 상태가 변하는 데모에만 상태 wrapper를 둡니다. 모든 수치/뉴스는 정적 fixture로 두고 실제 API를 호출하지 않습니다.

## 접근성/완료 기준

- 입력·버튼 레이블, 탭 키보드 이동, 포커스, 테이블 정렬 상태, 차트 대체 설명을 확인합니다.
- 상승/하락은 색상만이 아니라 부호/텍스트도 표시합니다.
- Storybook에서 기존 및 신규 컴포넌트의 필수 상태를 찾고 재현할 수 있습니다.
- 개발 서버와 정적 Storybook 빌드를 확인합니다.
- 앱 프로덕션 빌드에는 Storybook 전용 코드가 들어가지 않습니다.

## 공식 참고

- [설치 가이드](https://storybook.js.org/docs/get-started/install)
- [TanStack React 통합](https://storybook.js.org/docs/get-started/frameworks/tanstack-react)
- [스토리 작성](https://storybook.js.org/docs/writing-stories)
