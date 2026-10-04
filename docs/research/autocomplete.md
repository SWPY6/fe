# 공통 Autocomplete 선택과 사용

## 선택 근거

2026-10-02 확인. [공통 컴포넌트 원칙 #23](https://github.com/SWPY6/fe/issues/23)에 따라
기존 UI 확장과 registry 후보를 먼저 비교했다.

| 후보                                                                                                         | 판단                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 기존 Input + Select / Popover                                                                                | Input 스타일은 재사용한다. Select는 편집 가능한 입력이 아니며 Popover만으로는 후보 이동·선택·접근성 연결이 해결되지 않는다. 이를 직접 구현하지 않는다.                                                                    |
| [shadcn 공식 Combobox registry](https://ui.shadcn.com/r/styles/new-york-v4/combobox.json)                    | Base UI Combobox를 사용한다. 기존 Input을 render로 연결할 수 있어 선택했다. registry 전체를 복사하지 않고 필요한 동작만 사용한다.                                                                                         |
| [shadcn v3 Combobox](https://v3.shadcn.com/docs/components/combobox)                                         | Popover와 Command를 조합한다. cmdk 추가와 입력·팝오버 조율이 필요해 이번에는 사용하지 않는다.                                                                                                                             |
| [Kibo UI Combobox](https://www.kibo-ui.com/components/combobox)                                              | 제3자 registry 후보. 검색·빈 결과·키보드와 제어 상태를 지원하는 공개 예제를 확인했다. 버튼으로 여는 선택 UI보다 바로 입력하는 공식 Base UI 구성이 이번 요구에 가깝다. registry 원본 소스와 내부 의존성은 확인하지 못했다. |
| [HTML datalist](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist#accessibility) | 의존성은 없지만 목록 스타일 제어와 접근성의 브라우저 차이 때문에 토큰·빈 상태 요구를 충족하기 어렵다.                                                                                                                     |

직접 의존성은 `@base-ui/react` 1.8.0 하나를 추가한다. 설치된 `radix-ui`와
`react-simplikit`에는 이 동작을 맡길 Combobox가 없었다. 기존 Input, cn, 아이콘과
색상·타이포그래피 토큰은 재사용한다. 배경은 `popover`, 경계는 `border`, 강조는
`accent`를 사용하고 입력 초점은 Input의 `ring`을 그대로 따른다.

후보 항목은 Combobox.Item이 렌더링하고 프로젝트의 타이포그래피,
accent와 foreground 토큰을 사용한다. 후보의 강조 상태는 Combobox의
`data-highlighted`를 따르며 별도의 hover 배경을 겹치지 않는다.
자동완성 전용 상태와 크기를 공통 Button의 variant로 추가하지 않는다.

Base UI를 사용하면 편집 가능한 입력과 후보 이동·선택을 직접 구현하지 않아도 된다.
다만 기존 Radix와 서로 다른 컴포넌트 API를 함께 유지해야 하는 비용이 있다.
Radix Popover와 Command를 조합하는 대안도 있으며 현재 프로젝트에는 cmdk가 없다.
새 기반 라이브러리의 채택 여부는 이 비용을 포함해 팀에서 검토할 사항이다.
입력 이름은 기존 `Label`, 빈 결과 안내와 후보 설명은 `Typography`를 재사용한다.
Empty의 `render`에 `Typography as="output"`을 전달해 상태 메시지 역할을 유지한다.
`empty:p-0`은 후보가 있을 때 남는 안내 여백을 없애므로 제거하지 않는다.

## 사용처와 컴포넌트의 역할

```text
사용처가 items와 filter 전달 → 입력에 맞는 후보 표시
후보를 클릭하거나 Enter → onValueChange → 사용처가 후속 동작 결정
```

- `items`: `{ value, label, description? }[]`. `value`는 목록 안에서 고유해야 한다.
- `label`: 화면에 보이는 입력 이름이자 접근성 이름이다.
- 기본 검색은 Base UI의 label 필터다. 코드 검색 등은 `filter`로 전달한다.
- `value`와 `onValueChange`를 함께 전달하면 사용처가 선택 상태를 관리한다.
  선택을 지울 때는 `value`를 `null`로 설정한다.
- `inputValue` / `onInputValueChange`로 입력 상태도 별도로 관리할 수 있다.
  이미 필터링된 외부 후보를 사용할 때는 `filter={null}`을 전달할 수 있다.
- 키보드·포커스·ARIA와 팝업 위치 계산은
  [Base UI Combobox](https://base-ui.com/react/components/combobox)에 맡긴다.
- 목록은 입력 아래로만 열린다. 위로 뒤집는 자동 배치는 끄고, 아래 공간이 부족하면
  남은 높이 안에서 Popup 전체를 스크롤한다. List에는 별도의 스크롤을 두지 않아
  긴 빈 결과 안내도 같은 제한을 받는다. 가로 위치만 화면 안으로 조정한다.
- 실제 데이터 요청과 화면 이동은 포함하지 않는다. 종목 예시는 Storybook에만 있다.

헤더 검색창이나 라우트는 연결하지 않는다. 긴 목록의 가상화, 실제 API의 로딩·실패 상태,
실제 보조공학의 음성 출력은 이번 구현·검증 범위 밖이다.

## 검증 대상

- 사용처의 필터, 선택 결과, 외부 초기화는 실제 상태를 가진 예제로 검증한다.
- 후보 객체가 새로 만들어져도 고유 값 기준으로 선택을 유지한다.
- 마우스 선택, 방향키·Enter·Escape, 빈 결과와 비활성 상태를 확인한다.
- 강조 상태 속성뿐 아니라 브라우저가 계산한 실제 배경색을 확인한다.
- 화면 하단에서 긴 목록과 긴 빈 결과 안내가 입력 아래에 표시되고,
  실제 휠 입력 후 팝업의 스크롤 위치가 바뀌는지 확인한다.
- Storybook은 기본·빈 결과·비활성·화면 하단 긴 목록·화면 하단 긴 안내를 제공한다.
- 실제 API 연동과 스크린리더 음성 출력은 검증 범위 밖이다.

## 2026-10-03 로컬 검증

- 타입 검사, 린트, 포맷 검사, 앱 빌드, Storybook 빌드 통과.
- 전체 테스트 21개 파일, 165개 통과.
- 이번 변경 후 자동완성 테스트는 Chromium·Firefox·WebKit에서 각각 12개 통과했다.
- Storybook의 다섯 상태를 1280px·320px에서 확인했다. 가로 넘침과 실행 오류가 없었다.
- 화면 하단의 목록과 긴 빈 안내는 입력 아래에서 열렸고 실제 휠 입력으로 스크롤됐다.
