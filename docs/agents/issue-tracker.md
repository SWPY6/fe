# Issue 관리

이 저장소에서는 GitHub Issue를 작업의 기준으로 사용한다. GitHub 작업은 저장소 안에서 `gh`
CLI로 수행하여 `origin` 원격 저장소를 자동으로 사용한다.

## Issue 작성 원칙

Issue는 다음 작업자가 구현을 시작하고 완료 여부를 판단할 수 있는 기준 작업으로 작성한다.

- Issue에는 구현과 검증에 필요한 의도, 범위, 결정 사항과 완료 조건만 기록한다.
- 구현 중 의도, 범위나 완료 조건이 바뀌면 현재 Issue에 반영한다.
- 관련 Issue, 조사, 설계와 의사결정 기록은 내용을 복사하지 않고 원본을 연결한다.
- 정해진 목차를 억지로 채우지 않는다. 확인하지 않은 내용은 만들지 않는다.

## 작업 시작

1. Issue 본문과 댓글을 모두 읽는다: `gh issue view <번호> --comments`
2. 구현을 맡으면 자신을 담당자로 지정한다: `gh issue edit <번호> --add-assignee @me`
3. `main`에서 Issue 연결 브랜치를 만들고 체크아웃한다:
   `gh issue develop <번호> --name <유형>/<주제> --base main --checkout`
4. 연결 여부를 확인한다: `gh issue develop --list <번호>`

작업 브랜치는 반드시 해당 Issue의 Development 항목에 연결한다. 별도로 만든 브랜치에서
작업을 시작하지 않는다.

## Issue 명령어

- 생성: `gh issue create --title "..." --body "..."`
- 전체 내용 조회: `gh issue view <번호> --comments`
- 본문 수정: `gh issue edit <번호> --body "..."`
- 댓글 작성: `gh issue comment <번호> --body "..."`
- 목록 조회: 필요한 필터와 JSON 필드를 지정한 `gh issue list`
- 닫기: `gh issue close <번호> --comment "..."`

본문이 길면 본문 파일이나 셸에서 안전한 여러 줄 입력을 사용한다. 기존 Issue를 수정하기
직전에 본문과 댓글을 다시 읽고, 사용자가 변경한 내용을 보존한다.

스킬이 Issue 게시를 요구하면 GitHub Issue를 생성하거나 수정한다. 티켓 조회를 요구하면
본문과 댓글을 모두 읽는다.

## Pull Request

Pull Request는 구현과 검토 기록이다. `main`을 대상으로 만들고 본문에 `Closes #<번호>`를
넣어 연결된 Issue가 squash merge 시 닫히게 한다. 조회와 변경에는 `gh pr view <번호>
--comments`, `gh pr diff <번호>`, `gh pr create`, `gh pr edit`, `gh pr comment`를 사용한다.

GitHub Issue와 Pull Request는 번호 공간을 공유한다. 번호만 주어져 종류가 불분명하면
`gh pr view <번호>`를 먼저 실행하고, 실패하면 `gh issue view <번호>`로 확인한다.

## 작업 관계

하나의 상위 작업을 여러 티켓으로 나눌 때는 GitHub 하위 Issue와 기본 종속 관계를 사용한다.
하위 Issue를 먼저 만든 다음 실제 Issue 식별자로 관계를 연결한다. GitHub 기본 관계를 사용할
수 없을 때만 본문에 상위 작업이나 `Blocked by` 관계를 적는다.

- 작업 묶음: 상위 Issue 하나에 관련 티켓을 하위 Issue로 연결한다. 별도 워크플로에서 검색이
  필요할 때만 라벨을 사용한다.
- 차단 관계: `gh api --method POST repos/<소유자>/<저장소>/issues/<하위 번호>/dependencies/blocked_by -F issue_id=<차단 Issue DB ID>`를 사용한다.
  `<차단 Issue DB ID>`는 `gh api repos/<소유자>/<저장소>/issues/<번호> --jq .id`로 조회한다.
  화면에 표시되는 Issue 번호나 GraphQL 노드 ID를 사용하지 않는다.
- 착수 가능 작업: 상위 Issue의 열린 하위 Issue 중 담당자가 없고 열린 차단 작업도 없는 항목을
  찾는다.
- 완료: 결과와 검증 내용을 GitHub에 기록하고 Issue를 닫는다. 결과로 상위 Issue의 의도,
  범위나 결정이 바뀌면 상위 Issue도 수정한다.
