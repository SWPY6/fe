# 컴포넌트 분류와 Hook 원칙

## 현재 상태

현재 프로젝트의 src/components에는 다음이 있습니다.

- ui/Card 계열: 도메인에 종속되지 않는 기본 UI
- common/ChangeRate와 stories: 상승·하락·보합·데이터 없음 표시
- articles/RelatedArticleCard와 stories: 뉴스·공시 도메인 정보 카드
- Storybook 설정은 이미 .storybook에 구성되어 있음

따라서 작업은 Storybook을 새로 설치하는 것이 아니라 기존 구성을 사용해 더 많은 목업 UI 상태를 기록하는 것입니다.

## 컴포넌트 분류 원칙

1. **UI primitive**: Card, Button, Tabs, Select, Table 등 기본 구조와 접근성 동작. src/components/ui/.
2. **앱 공통/layout**: Header, PrimaryNavigation, PageHeading, MarketSelector, DataTimestamp, DemoNotice 등 여러 화면 또는 영역에서 재사용할 패턴. src/components/common/ 또는 src/components/layout/.
3. **도메인 기능**: IndustryCarousel, MarketSnapshot, IndexChart, KeyNewsList, MoversTable처럼 주식 대시보드 업무를 표현하는 큰 UI. src/components/market/ 또는 src/components/news/.
4. 이름에 Card, Panel, Table이 들어간다고 자동으로 공통 부품은 아닙니다. 공통성은 재사용 구조/동작으로 판단하고, 기능 영역은 도메인 폴더에 둡니다.
5. 시장명, 통화, 예시 종목 수, 기준 시각은 데이터입니다. 그 값을 표시하는 역할이 반복될 때 표시 컴포넌트로 분리합니다.
6. 화면에서 확인되지 않은 기능/API를 추측해 만들지 않습니다. 모든 예시 수치와 뉴스는 데모 데이터임을 표시합니다.

## Custom Hook 원칙

- 공용 custom hook은 src/hooks/에 두고 함수명은 use로 시작합니다.
- React 내장 Hook은 별도 파일로 옮기지 않습니다.
- 시장 탭/차트 기간/정렬처럼 단순한 선택값은 우선 소유 컴포넌트나 페이지의 useState로 관리합니다.
- 산업 자동 전환처럼 타이머와 pause/fix 정책이 함께 있는 로직은 실제로 필요하면 useIndustryRotation 같은 custom hook으로 분리할 수 있습니다. effect와 타이머는 정리합니다.
- API가 아직 연결되지 않은 데모는 정적 fixture를 사용합니다. 실제 endpoint가 정해지면 설치된 TanStack Query를 통한 query hook을 검토합니다.
- useMemo/useCallback/useRef는 필요를 확인한 뒤 사용합니다. 성능을 이유 없이 최적화하거나 빈 Hook을 만들지 않습니다.
- 전역 Zustand 상태는 여러 route 간 공유/보존 요구가 확인될 때만 도입합니다.

## 완료 기준

- 각 컴포넌트가 범용 UI, 공통 layout, 도메인 기능 중 하나로 설명됩니다.
- props는 표시 데이터와 사용자 동작을 분명히 구분합니다.
- custom hook은 실제 상태ful 로직만 담당하며 API/데이터 책임을 임의로 추가하지 않습니다.
