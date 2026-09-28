import { cn } from "cn"
import * as React from "react"

type PriceNumberProps<Tag extends React.ElementType = "span"> = {
  as?: Tag
  value: number
  format?: Intl.NumberFormatOptions
} & Omit<
  React.ComponentPropsWithRef<Tag>,
  "as" | "value" | "format" | "children" | "dangerouslySetInnerHTML"
>

export function PriceNumber<Tag extends React.ElementType = "span">({
  as,
  value,
  format,
  className,
  ...props
}: PriceNumberProps<Tag>) {
  const text = new Intl.NumberFormat("ko-KR", format).format(value)
  const Component = as ?? "span"

  return (
    <Component
      data-slot="price-number"
      {...props}
      className={cn(
        "tabular-nums",
        {
          "text-positive": value > 0,
          "text-negative": value < 0,
          "text-neutral": value === 0,
        },
        className,
      )}
    >
      {text}
    </Component>
  )
}
