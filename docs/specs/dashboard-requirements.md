# PLOUTOS 대시보드 컴포넌트 요구사항

## 목적과 한계

공유된 국내/해외시장 목업의 구조와 상태를 독립 컴포넌트로 구현하고 Storybook에서 확인합니다. 전체 서비스 페이지, 실제 금융 데이터/API, 거래·알림 발송을 구현하는 작업은 아닙니다. 모든 수치는 정적 예시 데이터로 표시하고 데모 고지를 유지합니다.

## 기존 구현: 유지·확장

| 컴포넌트                                  | 분류                | 다음 작업                                                   |
| ----------------------------------------- | ------------------- | ----------------------------------------------------------- |
| Card, CardHeader, CardContent, CardFooter | UI primitive        | 현재 구현을 재사용                                          |
| ChangeRate                                | 공통 금융 표시 UI   | 기존 동작을 유지, 지수/종목 story에서 재사용                |
| RelatedArticleCard                        | 뉴스·공시 도메인 UI | 기존 구현을 유지, KeyNewsList와 연결 가능한 인터페이스 검토 |
| Storybook                                 | 컴포넌트 워크벤치   | 설치 재수행 없이 stories와 필요 설정을 확장                 |

## 새 UI 요구사항

### A. 앱 공통 셸

- **Header**: 브랜드, 종목 검색 입력, 알림 버튼, 로그인/회원가입 액션을 포함합니다. 검색 입력과 각 액션은 하위 UI로 분리할 수 있습니다. 이번 데모에서는 실제 인증/알림/API를 연결하지 않습니다.
- **PrimaryNavigation**: 시장 요약, 산업별 동향, 주요 변동 종목, 종목 상세 항목을 보여줍니다. 현재 선택 메뉴 표시와 키보드 접근성을 제공합니다. 실제 route가 없는 항목은 목적지를 꾸며내지 않습니다.
- **PageHeading/Breadcrumb**: 현재 위치 레이블과 페이지 제목을 별도 의미로 표현합니다. 사이트 브랜드/메뉴와 혼합하지 않습니다.
- **MarketSelector**: 국내시장·해외시장 탭. 선택값과 선택 변경 콜백을 props로 명확히 정의합니다.
- **MarketContext**: 선택 시장에 따른 설명(예: 한국 주식·KRW·36개 예시 종목)을 표시합니다. 문자열 데이터와 UI 구현을 구분합니다.
- **DataTimestamp**: 예시 데이터 기준 시각과 시간대, 기준 가격 설명(직전 거래일 종가 대비 등)을 표시합니다. 컴퓨터의 현재 시각으로 오해되지 않게 합니다.
- **DemoNotice**: 가격·그래프·뉴스가 디자인용 예시이며 실제 시세/투자 예측이 아님을 눈에 띄게 알립니다.
- **PrototypeDisclaimer**: 실제 거래/알림을 지원하지 않는 프로토타입임을 화면 하단에 명확히 표시합니다.

### B. 시장 요약

- **MarketSnapshot**: 한 시장의 여러 지표 카드를 묶습니다.
- **MarketIndexCard**: 지표명, 현재값, 등락률, 단위/통화, 필요 시 클릭 콜백을 표시합니다. 상승/하락은 ChangeRate를 재사용합니다.
- 국내 예시에는 KOSPI, KOSDAQ, USD/KRW, WTI를 포함할 수 있고 해외 예시에는 S&P 500, NASDAQ을 포함할 수 있습니다.
- 버튼처럼 동작할 때만 button semantics를 쓰고, 단순 표시 카드는 불필요한 버튼 역할을 갖지 않습니다.
- 긴 숫자와 단위가 모바일에서 잘리지 않도록 합니다.

### C. 산업별 동향

- **IndustryCarousel**은 활성 산업, 평균 등락률, 순위/구성 종목 수, 예시 종목 몇 개와 산업 선택 액션을 표시합니다.
- 이전/다음, 9개 산업 선택, 자동 전환 일시 정지, 산업 고정 동작이 필요합니다.
- 자동 전환은 사용자에게 pause 기능을 제공하고, 고정 선택 중에는 선택 산업이 자동으로 바뀌지 않아야 합니다.
- reduced-motion 선호를 존중하거나 자동 전환을 기본으로 끄는 접근성 방식을 정합니다.
- 빈 목록/종목 없음/최종 항목 다음과 첫 항목 이전 경계 동작을 정의합니다.
- timer가 실제 구현에 필요하면 정리(cleanup)를 포함하고, 이 로직이 복잡할 때만 custom hook을 만듭니다.

### D. 지수 차트

- **IndexChart**는 선택된 지수명, 값, 등락률, 기간별 시계열 예시를 표시합니다.
- **ChartControls**는 기간(1개월/3개월/6개월/1년), 모양(예: 라인), 확대/축소/초기화 컨트롤을 제공합니다.
- 선택한 기간/차트 모양을 명확히 표시하고 키보드로 조작할 수 있습니다.
- 실제 시세 API나 투자 예측을 추가하지 않습니다. Chart 라이브러리가 이미 없으면 큰 의존성을 임의 추가하기 전 작은 SVG 또는 기존 프로젝트 패턴을 우선 검토합니다.
- 그래프는 접근 가능한 제목/설명을 갖고, 색만으로 상승/하락/기준선을 구분하지 않습니다.
- 휠 확대 같은 포인터 동작이 있으면 버튼/키보드 대안도 제공합니다.

### E. 핵심 뉴스와 종목 표

- **KeyNewsList**는 상승/하락 산업 요약, 선정 근거, 확인된 뉴스·공시 맥락, 관련 종목으로 가는 액션을 묶습니다.
- 뉴스는 가격 변화의 원인이라고 단정하지 않는 안내 문구를 유지합니다.
- 기존 RelatedArticleCard는 기사/공시의 제목·출처·시각·요약·원문 링크 표현에 재사용할 수 있습니다.
- **MoversTable**는 순위, 종목/티커, 현재가, 등락률, 거래량, 평소 대비, 시가총액, 거래대금, 변동 이유의 예시 열을 표현합니다.
- 정렬 가능한 열은 버튼으로 조작하고 현재 정렬 열/방향을 접근성 속성으로 전달합니다.
- 표의 행은 종목 상세를 실제로 연결할 때만 링크/버튼 의미를 가집니다. 단순 표시 셀은 인터랙티브 역할을 갖지 않습니다.
- 최대 100개 예시 데이터와 페이지당 20개 기준을 표현할 경우, 이전/다음, 현재 페이지, 비활성 경계 상태를 표시합니다.
- 작은 화면에서 전체 데이터가 조용히 잘리지 않도록 가로 스크롤 또는 명확한 카드 전환 방식을 사용합니다.

## 반응형/접근성/데이터

- 데스크톱과 모바일에서 정보 우선순위를 보존합니다.
- 제목/본문/링크는 시맨틱 HTML, 키보드 focus, 입력 레이블을 갖습니다.
- 상승/하락은 색상과 함께 부호/텍스트를 사용합니다. 통화와 숫자 표기 기준을 props/fixture에서 명확히 합니다.
- 모든 숫자·뉴스·시간은 예시이며, 실시간/예측 정보로 오해할 표시를 하지 않습니다.
- loading/error/empty UI는 실제 API가 없는 스토리에서 필요한 것만 표현하며, 실제 fetching은 이번 구현 범위 밖입니다.

## 제안 폴더 구조

    src/components/
      ui/                 # Card, Tabs, Button, Select, Table 등 도메인 중립 primitive
      common/             # ChangeRate, MarketSelector, DataTimestamp, DemoNotice 등
      layout/             # Header, PrimaryNavigation, PageHeading
      market/             # MarketSnapshot, MarketIndexCard, IndustryCarousel, IndexChart
      news/               # KeyNewsList; RelatedArticleCard 위치는 기존 분류 결정에 따라 유지 가능
      stocks/             # MoversTable

기존 src/components/articles/RelatedArticleCard.tsx는 명세 적용 중 기사 도메인 구조를 유지해도 됩니다. 대규모 이동만을 위한 이동은 피합니다.

## 단계별 구현 순서

1. P0 현재 ChangeRate/RelatedArticleCard/Storybook을 보존하고 새 구현의 기준으로 사용합니다.
2. P1 셸: Header, PrimaryNavigation, PageHeading, MarketSelector, MarketContext, DataTimestamp, DemoNotice, PrototypeDisclaimer.
3. P2 시장/산업: MarketIndexCard/MarketSnapshot, IndustryCarousel.
4. P3 데이터 보기: IndexChart/ChartControls, KeyNewsList, MoversTable.
5. 각 단계는 API 없는 정적 fixture와 Storybook stories로 먼저 검증하고, 페이지 통합은 실제 라우트 범위를 정한 후 진행합니다.

## 완료 기준

- P1~P3의 컴포넌트 기능과 상태가 Storybook에서 독립 확인됩니다.
- 공통 셸과 도메인 기능이 폴더/이름에서 구분됩니다.
- 국내/해외, 기본/일시정지/고정, 차트 기간/모양, 테이블 정렬/페이지 상태를 조작하거나 볼 수 있습니다.
- 모바일 폭, 키보드 탐색, 긴 텍스트, 데모 고지를 확인합니다.
- 기존 Storybook 실행/빌드와 프로젝트 타입·린트·빌드가 유지됩니다.
