---
name: project-workflow
description: GitHub 기반 저장소 변경 작업을 시작하거나 재개한다. 현재 Issue·연결 브랜치·Pull Request에서 진행 상태를 확인하고 필요한 스킬을 이어서 적용한다.
---

# 프로젝트 작업 흐름

하나의 호출로 현재 진행 상태를 확인하고 완료까지 진행한다. 하위 스킬이 끝나면 이 흐름으로 돌아와 다음
작업을 이어간다.

## 현재 상태 확인

[`Issue 관리 가이드`](../../../docs/agents/issue-tracker.md)에 따라 대화에 언급된 작업, 현재 브랜치와
작업 트리, GitHub의 Issue·Development 연결·Pull Request·검사 결과를 확인한다. 기존 변경과
GitHub 기록이 어느 작업에 해당하는지 확인되면 현재 상태 파악이 완료된 것이다.

확인한 내용을 다음 작업 흐름에 대입한다. 이미 충족된 결과는 건너뛰고, 증거가 없는 첫 결과부터
실행한다. 이어갈 작업이 둘 이상이고 선택에 따라 범위가 달라질 때만 사용자에게 묻는다.

## 기본 작업 흐름

1. **기준 작업** — 현재 요청과 결정이 하나의 Issue에 남아 있어야 한다. Issue가 없거나 현재
   의도와 다르면 [`to-spec`](../to-spec/SKILL.md)을 읽고 적용한다. 다음 작업자가 Issue만으로
   의도·범위·완료 조건을 판단할 수 있으면 완료다.
2. **작업 브랜치** — Issue 관리 가이드에 따라 `main`에서 파생된 연결 브랜치를 사용한다.
   Development 연결이 확인되면 완료다.
3. **구현** — 하나의 Issue로 검증 가능한 작업은 [`implement`](../implement/SKILL.md)을 읽고
   적용한다. 독립적인 완료 결과와 선후 관계가 실제로 필요한 작업만
   [`to-tickets`](../to-tickets/SKILL.md)으로 나눈 뒤
   [`implement-spec`](../implement-spec/SKILL.md)을 읽고 적용한다. Issue의 완료 조건과 저장소의
   필수 검사가 모두 통과하면 완료다.
4. **검토와 Pull Request** — [`code-review`](../code-review/SKILL.md)을 적용하고 발견 사항을
   해결한다. Issue 관리 가이드에 맞는 `main` 대상 Pull Request가 현재 결정과 검증 결과를 담고,
   CI가 통과하면 완료다.

각 결과가 확인되면 GitHub와 로컬 상태를 다시 읽고 다음 미완료 결과로 진행한다. 다음 스킬을
안내하는 것으로 단계를 끝내지 않는다.

## 필요할 때 추가하는 과정

기본 작업 흐름을 진행하는 데 필요한 경우에만 적용하고, 끝나면 원래 작업으로 돌아온다.

- 구현을 바꾸는 결정이 남아 있으면 [`grill-with-docs`](../grill-with-docs/SKILL.md), 외부 근거가
  필요하면 [`research`](../research/SKILL.md), 실행해 봐야 답할 수 있으면
  [`prototype`](../prototype/SKILL.md)을 적용하고 기준 Issue를 갱신한다.
- 재현과 원인 규명이 필요한 실패는 [`diagnosing-bugs`](../diagnosing-bugs/SKILL.md)을 적용한다.
- 진행 중인 merge 또는 rebase 충돌은
  [`resolving-merge-conflicts`](../resolving-merge-conflicts/SKILL.md)을 적용한다.

## 작업 범위

원격 항목을 수정하기 직전에 다시 읽어 사용자의 변경을 보존한다. 현재 요청에 명시된 커밋·push·
Pull Request 제한을 완료 조건보다 우선하며, merge는 명시적인 요청이 있을 때만 수행한다.

사용자 결정이나 새로운 권한이 필요하지 않다면 단계 사이에서 멈추지 않는다. 중단 후에는 저장된
단계가 아니라 실제 GitHub와 로컬 상태를 다시 확인하고 이어간다.
