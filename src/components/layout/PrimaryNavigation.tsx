import { Button } from "../ui/Button"

export type NavigationSection = "summary" | "industries" | "movers" | "detail"
const items: { value: NavigationSection; label: string }[] = [
  { value: "summary", label: "시장 요약" },
  { value: "industries", label: "산업별 동향" },
  { value: "movers", label: "주요 변동 종목" },
  { value: "detail", label: "종목 상세" },
]

export function PrimaryNavigation({
  value,
  onChange,
}: {
  value: NavigationSection
  onChange: (value: NavigationSection) => void
}) {
  return (
    <nav aria-label="주 메뉴 · 화면 선택 예시" className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Button
          key={item.value}
          aria-pressed={value === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  )
}
