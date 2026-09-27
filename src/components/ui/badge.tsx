import { cn } from "cn"
import * as React from "react"

const toneClasses = {
  neutral: "bg-secondary text-secondary-foreground",
  positive: "bg-positive-soft text-positive",
  negative: "bg-negative-soft text-negative",
} as const

function Badge({
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<"span"> & { tone?: keyof typeof toneClasses }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center rounded-sm px-2 typo-label-xs whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
