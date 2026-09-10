# AGENTS.md

## 프로젝트

- Node.js 24.20.0
- React 19, TanStack Router, Vite 8, TypeScript 7
- Tailwind CSS 4
- Vitest, Oxlint, Oxfmt, Lefthook

## GitHub 협업 전략

모든 작업은 GitHub을 기반으로 진행한다.

- Issue, Pull Request, 연결 브랜치 또는 커밋을 다룰 때는 GitHub 작업의 단일 기준인
  `docs/agents/issue-tracker.md`를 읽는다.
- 공통 도메인 용어나 기존 설계 결정이 필요한 작업은 `docs/agents/domain.md`를 읽는다.

## 구현 가이드

- 유틸리티 관련 함수를 자체적으로 만들기 전, `es-toolkit` 활용을 고려한다.

## 명령어

- `pnpm dev`: 로컬 개발 서버 실행
- `pnpm test`: 테스트를 감시 모드로 실행
- `pnpm check`: 타입, 린트, 포맷과 테스트를 한 번에 검사
- `pnpm build`: 타입 검사 후 프로덕션 빌드 생성
