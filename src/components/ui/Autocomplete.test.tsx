import { useState } from "react"
import { afterEach, expect, test, describe } from "vitest"
import { cleanup, render } from "vitest-browser-react"
import { page, userEvent } from "vitest/browser"

import "../../index.css"
import { Autocomplete, type AutocompleteOption, type AutocompleteProps } from "./Autocomplete"

afterEach(cleanup)

const options: AutocompleteOption[] = [
  { value: "first", label: "같은 이름", description: "첫 번째" },
  { value: "second", label: "같은 이름", description: "두 번째" },
]

function ControlledExample({
  items = options,
  filter,
}: Pick<AutocompleteProps, "filter"> & { items?: AutocompleteOption[] }) {
  const [value, setValue] = useState<AutocompleteOption | null>(null)
  return (
    <>
      <Autocomplete
        label="항목 선택"
        items={items}
        filter={filter}
        value={value}
        onValueChange={setValue}
      />
      <output aria-label="선택 결과">{value?.value ?? "선택 없음"}</output>
      <button type="button" onClick={() => setValue(null)}>
        초기화
      </button>
    </>
  )
}

function getPopup() {
  const popup = document.querySelector<HTMLElement>('[data-slot="autocomplete-popup"]')
  if (!popup) throw new Error("자동완성 팝업이 열리지 않았습니다.")
  return popup
}

describe("검색과 선택", () => {
  test("사용처에서 전달한 필터로 고유 값을 검색한다", async () => {
    await render(<ControlledExample filter={(item, query) => item.value.includes(query)} />)
    await page.getByRole("combobox", { name: "항목 선택" }).fill("second")
    await expect.element(page.getByRole("option", { name: "같은 이름 두 번째" })).toBeVisible()
    await expect
      .element(page.getByRole("option", { name: "같은 이름 첫 번째" }))
      .not.toBeInTheDocument()
  })

  test("같은 이름의 두 번째 후보를 클릭하면 second가 선택된다", async () => {
    await render(<ControlledExample />)
    const input = page.getByRole("combobox", { name: "항목 선택" })
    await input.fill("같은")
    await page.getByRole("option", { name: "같은 이름 두 번째" }).click()
    await expect
      .element(page.getByRole("status", { name: "선택 결과" }))
      .toHaveTextContent("second")
    await expect.element(input).toHaveValue("같은 이름")
  })
})

describe("사용처에서 선택값 관리", () => {
  test("후보 객체가 새로 만들어져도 선택한 고유 값은 유지된다", async () => {
    const screen = await render(<ControlledExample />)
    const input = page.getByRole("combobox", { name: "항목 선택" })
    await input.fill("같은")
    await page.getByRole("option", { name: "같은 이름 두 번째" }).click()

    await screen.rerender(<ControlledExample items={options.map((item) => ({ ...item }))} />)
    await userEvent.keyboard("{ArrowDown}")
    await expect
      .element(page.getByRole("option", { name: "같은 이름 두 번째" }))
      .toHaveAttribute("aria-selected", "true")
  })

  test("사용처가 선택값을 비우면 입력도 비워진다", async () => {
    await render(<ControlledExample />)
    const input = page.getByRole("combobox", { name: "항목 선택" })
    await input.fill("같은")
    await page.getByRole("option", { name: "같은 이름 두 번째" }).click()
    await page.getByRole("button", { name: "초기화" }).click()
    await expect.element(input).toHaveValue("")
    await expect
      .element(page.getByRole("status", { name: "선택 결과" }))
      .toHaveTextContent("선택 없음")
  })
})

describe("키보드 조작", () => {
  test("방향키로 이동한 후보를 Enter로 선택한다", async () => {
    await render(<ControlledExample />)
    const input = page.getByRole("combobox", { name: "항목 선택" })
    await input.click()
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}{Enter}")
    await expect.element(page.getByRole("status", { name: "선택 결과" })).toHaveTextContent("first")
    await expect.element(input).toHaveAttribute("aria-expanded", "false")
  })

  test("Escape로 목록을 닫으면 후보를 선택하지 않는다", async () => {
    await render(<ControlledExample />)
    const input = page.getByRole("combobox", { name: "항목 선택" })
    await input.click()
    await userEvent.keyboard("{ArrowDown}{Escape}")
    await expect.element(input).toHaveAttribute("aria-expanded", "false")
    await expect.element(input).toHaveFocus()
    await expect
      .element(page.getByRole("status", { name: "선택 결과" }))
      .toHaveTextContent("선택 없음")
  })
})

describe("빈 결과와 비활성 상태", () => {
  test("검색 결과가 없으면 상태 메시지를 표시한다", async () => {
    await render(<Autocomplete label="항목 선택" items={options} />)
    await page.getByRole("combobox", { name: "항목 선택" }).fill("없는 항목")
    await expect.element(page.getByRole("status")).toHaveTextContent("일치하는 결과가 없습니다.")
    await expect.element(page.getByRole("option")).not.toBeInTheDocument()
  })

  test("후보가 다시 나타나면 빈 결과 안내의 여백도 사라진다", async () => {
    await render(<Autocomplete label="항목 선택" items={options} />)
    const input = page.getByRole("combobox", { name: "항목 선택" })
    await input.fill("없는 항목")
    const status = page.getByRole("status")
    await expect.element(status).toHaveTextContent("일치하는 결과가 없습니다.")
    await input.fill("같은")
    await expect.element(status).toBeEmptyDOMElement()
    await expect.element(status).toHaveStyle({ paddingTop: "0px", paddingBottom: "0px" })
  })

  test("비활성 입력은 Tab으로 건너뛴다", async () => {
    await render(
      <>
        <button type="button">이전</button>
        <Autocomplete label="항목 선택" items={options} disabled />
        <button type="button">다음</button>
      </>,
    )
    await expect.element(page.getByRole("combobox", { name: "항목 선택" })).toBeDisabled()
    await page.getByRole("button", { name: "이전" }).click()
    await userEvent.keyboard("{Tab}")
    await expect.element(page.getByRole("button", { name: "다음" })).toHaveFocus()
    await expect.element(page.getByRole("listbox")).not.toBeInTheDocument()
  })
})

describe("현재 후보 강조", () => {
  test("방향키로 이동하면 강조 배경도 새 후보로 이동한다", async () => {
    await render(<Autocomplete label="항목 선택" items={options} />)
    await page.getByRole("combobox", { name: "항목 선택" }).click()
    const first = page.getByRole("option", { name: "같은 이름 첫 번째" })
    const second = page.getByRole("option", { name: "같은 이름 두 번째" })
    await userEvent.keyboard("{ArrowDown}")
    await userEvent.hover(first)
    await expect.element(first).toHaveAttribute("data-highlighted")
    await expect
      .poll(() => getComputedStyle(first.element()).backgroundColor)
      .not.toBe("rgba(0, 0, 0, 0)")
    const highlightedColor = getComputedStyle(first.element()).backgroundColor
    await userEvent.keyboard("{ArrowDown}")
    await expect.element(second).toHaveAttribute("data-highlighted")
    await expect.element(first).not.toHaveAttribute("data-highlighted")
    await expect
      .poll(() => getComputedStyle(second.element()).backgroundColor)
      .toBe(highlightedColor)
    await expect
      .poll(() => getComputedStyle(first.element()).backgroundColor)
      .toBe("rgba(0, 0, 0, 0)")
  })
})

describe("6. 화면 하단 스크롤 테스트", () => {
  test("화면 하단의 긴 목록을 팝업 안에서 휠로 스크롤한다", async () => {
    await render(
      <div className="fixed inset-x-4 bottom-24">
        <Autocomplete
          label="항목 선택"
          items={Array.from({ length: 20 }, (_, index) => ({
            value: `${index}`,
            label: `항목 ${index}`,
          }))}
        />
      </div>,
    )
    const input = page.getByRole("combobox", { name: "항목 선택" })
    await input.click()
    await userEvent.keyboard("{ArrowDown}")
    await expect.element(page.getByRole("listbox")).toBeVisible()
    await expect
      .poll(() => getPopup().getBoundingClientRect().top)
      .toBeGreaterThanOrEqual(input.element().getBoundingClientRect().bottom)
    await expect
      .poll(() => getPopup().getBoundingClientRect().bottom)
      .toBeLessThanOrEqual(window.innerHeight)

    const initialScrollTop = getPopup().scrollTop
    await page.getByRole("listbox").wheel({ direction: "down", times: 5 })
    await expect.poll(() => getPopup().scrollTop).toBeGreaterThan(initialScrollTop)
  })

  test("화면 하단의 긴 빈 결과 안내도 팝업 안에서 스크롤된다", async () => {
    const message =
      "일치하는 결과가 없습니다. 검색어를 확인하거나 다른 검색어를 입력해 주세요. ".repeat(20)
    await render(
      <div className="fixed inset-x-4 bottom-24">
        <Autocomplete label="항목 선택" items={[]} emptyMessage={message} />
      </div>,
    )
    const input = page.getByRole("combobox", { name: "항목 선택" })
    await input.fill("없는 항목")
    await expect.element(page.getByRole("status")).toHaveTextContent("일치하는 결과가 없습니다.")
    await expect
      .poll(() => getPopup().getBoundingClientRect().top)
      .toBeGreaterThanOrEqual(input.element().getBoundingClientRect().bottom)
    await expect
      .poll(() => getPopup().getBoundingClientRect().bottom)
      .toBeLessThanOrEqual(window.innerHeight)
    expect(getPopup().scrollHeight).toBeGreaterThan(getPopup().clientHeight)

    const initialScrollTop = getPopup().scrollTop
    await page.getByRole("status").wheel({ direction: "down", times: 5 })
    await expect.poll(() => getPopup().scrollTop).toBeGreaterThan(initialScrollTop)
  })
})
