# PLOUTOS Codex 실행 프롬프트

프로젝트 Codex에 다음 프롬프트를 붙여넣으세요.

---

목업 분석을 기반으로 PLOUTOS 대시보드 UI 컴포넌트와 Storybook을 확장해줘. 시작하기 전에 AGENTS.md와 아래 명세를 읽고 현재 저장소 상태에 대조해.

- docs/specs/components-and-hooks.md
- docs/specs/dashboard-requirements.md
- docs/specs/storybook.md

## 반드시 현재 상태로 취급할 것

- 분석 자료에서 목업으로 확인된 요소는 화면 요구사항이지 실제 프로젝트 코드가 아니다.
- 현재 구현에는 ChangeRate와 RelatedArticleCard, 두 컴포넌트 stories, Storybook 설정이 있다. 이를 다시 만들거나 중복 설치하지 말고 보존·확장한다.
- React 19, TypeScript, Vite 8, Tailwind CSS 4, TanStack Router, pnpm을 사용한다.
- src/routes/index.tsx는 현재 기본 route다. 무관하게 덮어쓰거나 목업 전체 페이지로 대체하지 않는다.
- /demo Pretendard route, 기존 Card primitive와 프로젝트 토큰을 보존한다.

## 구현 지시

1. 먼저 P1~P3의 실행 계획과 파일 목록을 짧게 제시한 다음 구현한다.
2. 명세대로 공통 셸(P1), 시장/산업(P2), 차트/뉴스/종목 표(P3) 컴포넌트를 도메인별 폴더에 구현하고 기존 stories에 추가한다.
3. 모든 데이터는 정적 fixture로 만든다. 실제 시장 API, 로그인, 알림 발송, 거래, 투자 조언 기능은 만들지 않는다. 예시/기준 시각/통화/출처를 화면에서 구분한다.
4. 메뉴는 현재 실제 route가 있는 경우에만 연결한다. 없는 경로를 추측해서 내비게이션 링크로 만들지 않는다.
5. 공통/도메인/primitive 경계를 지키고 반복 사용이 없는 작은 문자열 표시를 과잉 컴포넌트화하지 않는다.
6. 단순 선택은 소유 컴포넌트의 state로 처리한다. 산업 자동 전환에 실제 타이머가 필요할 때만 effect와 cleanup을 구현하고, 반복/복잡성이 근거가 있을 때 useIndustryRotation 같은 custom hook을 만든다. 현재 두 표시 컴포넌트에 Hook을 추가하지 않는다.
7. 차트 라이브러리를 추가하기 전 기존 의존성과 명세의 SVG 대안을 확인하고, 대규모 새 의존성을 자동으로 추가하지 않는다.
8. 각 새 컴포넌트의 Storybook stories를 만들어 필수 상태를 재현한다. Storybook은 이미 설치되어 있으므로 공식 설치 CLI로 재초기화하지 않는다.
9. 전체 대시보드 route 통합은 이번 작업 범위로 가정하지 않는다. 컴포넌트와 Storybook까지 구현하고 별도 페이지 연결이 필요하면 보고한다.

## 보존/안전

- 사용자 변경, 기존 주석, 파일을 보존한다. 명세 밖 리팩터링을 하지 않는다.
- 외부 업로드, GitHub Issue/PR, 커밋, 푸시는 하지 않는다.
- 권한/네트워크 제한에 막히면 우회하지 말고 막힌 단계와 완료한 결과를 보고한다.

## 검증/보고

- Storybook 개발 서버 및 정적 빌드, 프로젝트 타입 검사·린트·프로덕션 빌드를 실행 가능한 범위에서 확인한다.
- 새 테스트 스위트는 요구되지 않는다.
- 변경 파일, 구현 단계별 완료 상태, 실행 명령과 결과, 남은 범위를 간단히 보고한다.
