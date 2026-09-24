import { Tabs } from "../ui/Tabs"
import type { ReactNode } from "react"

export type Market = "domestic" | "overseas"
export function MarketSelector({
  value,
  onChange,
  children,
}: {
  value: Market
  onChange: (value: Market) => void
  children?: ReactNode
}) {
  return (
    <Tabs
      label="시장 선택"
      value={value}
      onChange={onChange}
      options={[
        { value: "domestic", label: "국내시장" },
        { value: "overseas", label: "해외시장" },
      ]}
    >
      {children ?? (
        <p className="text-sm text-muted-foreground">
          {value === "domestic" ? "국내시장 선택 · KRW" : "해외시장 선택 · USD"}
        </p>
      )}
    </Tabs>
  )
}
