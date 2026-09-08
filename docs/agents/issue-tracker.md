# Issue 관리

이 저장소에서는 GitHub Issue를 작업의 기준으로 사용한다. GitHub 작업은 저장소 안에서 `gh`
CLI로 수행하여 `origin` 원격 저장소를 자동으로 사용한다.

## 작성 원칙

- Issue 제목은 문제나 원하는 상태를, Pull Request 제목은 적용한 변경 결과를 간결한 명사형으로
  표현한다. `~한다`와 같은 문장형 종결은 사용하지 않는다.
- 다음 작업자가 변경의 목적과 유지해야 할 판단을 복원할 수 있는 맥락만 남긴다. Diff나 관련 문서로
  알 수 있는 내용은 반복하지 않고 필요할 때 원본을 연결한다.
- 새 흐름, 상태 변화 또는 여러 주체의 관계가 있으면 `$show-me`를 사용한다. Issue는 원하는 동작을,
  Pull Request는 검토에 필요한 실제 구현 흐름을 Mermaid, 의사코드, 트리 중 가장 작은 시각화로
  보여준다. 두 흐름이 같으면 Pull Request에서 반복하지 않고 Issue를 연결한다.
- 정해진 목차를 억지로 채우거나 확인하지 않은 이유, 대안과 근거를 만들지 않는다.

## Issue 작성 원칙

Issue는 다음 작업자가 구현을 시작하고 완료 여부를 판단할 수 있는 기준 작업으로 작성한다.

- Issue에는 구현과 검증에 필요한 의도, 범위, 결정 사항과 완료 조건만 기록한다.
- 구현 중 의도, 범위나 완료 조건이 바뀌면 현재 Issue에 반영한다.

## 커밋

커밋 메시지는 영어로 작성한다. 제목은 변경 결과를 표현한다. 제목과 diff만으로 변경을 이해하기
어려울 때만 본문에 배경, 제약과 선택 근거를 기록한다. 단순하고 자명한 변경은 짧은 메시지로
작성한다.

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

이밖에 필요한 명령어들을 적극적으로 조사한 뒤 활용한다.
본문이 길면 본문 파일이나 셸에서 안전한 여러 줄 입력을 사용한다. 기존 Issue를 수정하기
직전에 본문과 댓글을 다시 읽고, 사용자가 변경한 내용을 보존한다.

스킬이 Issue 게시를 요구하면 GitHub Issue를 생성하거나 수정한다. 티켓 조회를 요구하면
본문과 댓글을 모두 읽는다.

## Pull Request

Pull Request는 구현과 검토 기록이다. Issue에 연결된 브랜치에서 `main` 대상 Pull Request를 만들고,
Development 연결을 확인한다. 연결된 Pull Request가 merge되면 Issue가 닫힌다. 조회와 변경에는
`gh pr view <번호> --comments`, `gh pr diff <번호>`, `gh pr create`, `gh pr edit`, `gh pr comment`를
사용한다.

- Development에 연결되어 merge 시 자동으로 닫히는 Issue는 `Closes #<번호>`로 반복하지 않는다.
- 본문에는 연결된 Issue의 의도가 구현된 흐름과 검토에 필요한 결정 또는 불확실성만 남긴다.
- Checks에서 확인할 수 있는 검증 명령과 결과는 Pull Request 본문에 반복하지 않는다.
- 작업 중 맥락이 달라지면 본문도 현재 상태에 맞게 갱신한다.

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
- 완료: 결과가 Pull Request와 Checks에 남았는지 확인하고 Issue를 닫는다. 결과로 상위 Issue의 의도,
  범위나 결정이 바뀌면 상위 Issue도 수정한다.
