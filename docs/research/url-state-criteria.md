# URL 상태를 선택하는 기준 조사

## 결론

**전역 상태인가, 한 화면의 상태인가는 URL에 넣을지 결정하는 기준이 아니다.** TanStack Router는 한 목록의 페이지 번호와 필터를 search parameter의 예시로 들고, React Router는 한 화면의 목록·상세 보기 전환을 URL로 표현하는 예시를 든다. 반대로 TanStack Router는 URL에 영구 기록할 필요가 없는 라우트 간 전달값에 `state`를 제공한다. 따라서 판단할 것은 **그 상태를 주소만으로 다시 열어야 하는가**다. [TanStack Router Search Params](https://tanstack.com/router/latest/docs/guide/search-params), [TanStack Router Navigation](https://tanstack.com/router/latest/docs/guide/navigation), [React Router State Management](https://reactrouter.com/explanation/state-management)

## 공식 문서의 판단 근거

| 요구                                                                              | 선택할 위치                 | 근거                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 링크를 복사하거나 북마크하고, 새 탭에서 열거나 새로고침해도 같은 상태를 보여야 함 | URL                         | TanStack Router가 search parameter의 가치를 설명할 때 이 동작들과 뒤로·앞으로 이동 시 상태 유지를 직접 든다. [TanStack Router Overview](https://tanstack.com/router/latest/docs/overview)                                                                                                                                                                           |
| 특정 화면 또는 특정 대상을 URL로 직접 열어야 함                                   | 경로 또는 경로 파라미터     | TanStack Router는 `posts/$postId`에서 URL의 ID를 읽어 해당 게시물을 조회하는 예시를 든다. 이는 대상 식별에 경로 파라미터를 쓰는 **예시**이지, 모든 상세 화면에 이를 강제하는 규칙은 아니다. [TanStack Router Path Params](https://tanstack.com/router/latest/docs/guide/path-params)                                                                                |
| 같은 화면에서 목록 조건이나 표시 방식을 바꾼 결과를 주소로 재현해야 함            | search parameter (`?`)      | TanStack Router는 페이지 번호·필터를, React Router는 목록·상세 보기 모드를 URL search의 예시로 든다. 해당 상태가 한 화면에만 적용된다는 사실은 URL 사용을 배제하지 않는다. [TanStack Router Navigation](https://tanstack.com/router/latest/docs/guide/navigation), [React Router State Management](https://reactrouter.com/explanation/state-management)            |
| 문서 안의 특정 섹션으로 링크해야 함                                               | fragment (`#`)              | fragment는 리소스 안의 특정 부분을 가리키며 서버 요청에 전송되지 않는다. [MDN URI fragment](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment)                                                                                                                                                                                                    |
| 이동할 때 다음 라우트로 값을 넘기되 주소에 계속 남길 필요는 없음                  | 라우터의 navigation `state` | TanStack Router는 `state`를 History API에 저장하며, URL search에 영구 기록하지 않을 라우트 간 데이터 전달에 유용하다고 설명한다. React Router도 `Link state`를 다음 location에 전달하는 기능으로 제공한다. [TanStack Router Navigation](https://tanstack.com/router/latest/docs/guide/navigation), [React Router Link](https://reactrouter.com/api/components/Link) |
| 잠깐 쓰는 화면 조작값이며 새로고침·공유·직접 진입 시 재현할 필요가 없음           | 컴포넌트 내부 상태          | React Router는 사이드바 열림을 React state로 다루는 예시를 들며, 이 상태는 새로고침이나 컴포넌트 재마운트 후 유지되지 않는다고 설명한다. [React Router State Management](https://reactrouter.com/explanation/state-management)                                                                                                                                      |

## `location.state`의 경계

History API의 `state`는 **브라우저 방문 기록 항목에 연결된 값**이며 주소 문자열 자체의 일부가 아니다. React Router는 이 값이 `history.state` 위에 구현돼 서버에서는 접근할 수 없다고 명시한다. 따라서 `state`만으로 종목을 지정한다면, 다른 사람이 같은 URL을 새 탭에서 직접 열었을 때 어떤 종목을 보여줄지는 별도로 정해야 한다. 이것은 새로고침 때 `state`가 반드시 사라진다는 주장과 다르다. [MDN History.state](https://developer.mozilla.org/en-US/docs/Web/API/History/state), [React Router Link](https://reactrouter.com/api/components/Link)

## 설계할 때 먼저 물을 질문

1. **주소만 받은 사람이 이 상태를 재현해야 하는가?** 그렇다면 URL에 필요한 식별값을 넣는다. TanStack Router가 제시하는 북마크·공유·새 탭 요구가 여기에 해당한다. [TanStack Router Overview](https://tanstack.com/router/latest/docs/overview)
2. **직접 진입할 대상인가, 같은 화면의 선택 조건인가?** 전자는 경로 파라미터, 후자는 search parameter가 공식 문서의 전형적인 예시다. 둘 사이에 강제적인 문법 규칙이 있다는 뜻은 아니다. [TanStack Router Path Params](https://tanstack.com/router/latest/docs/guide/path-params), [TanStack Router Navigation](https://tanstack.com/router/latest/docs/guide/navigation)
3. **현재 이동에서만 필요한 값인가?** 그렇다면 navigation `state`가 가능한 선택지다. 다만 URL만으로 직접 진입했을 때의 기본 동작을 정해야 한다. [TanStack Router Navigation](https://tanstack.com/router/latest/docs/guide/navigation), [React Router Link](https://reactrouter.com/api/components/Link)
4. **현재 컴포넌트에서만 잠시 필요한가?** 그렇다면 내부 상태로 충분하다. 새로고침이나 재마운트 후 유지가 필요해지면 저장 위치를 다시 결정한다. [React Router State Management](https://reactrouter.com/explanation/state-management)
