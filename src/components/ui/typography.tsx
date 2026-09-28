import { cn } from "cn"
import * as React from "react"

const typographyClasses = {
  "page-title": "typo-page-title",
  "section-heading": "typo-section-heading",
  subheading: "typo-subheading",
  "heading-xs": "typo-heading-xs",
  body: "typo-body",
  "body-sm": "typo-body-sm",
  label: "typo-label",
  "label-sm": "typo-label-sm",
  "label-xs": "typo-label-xs",
  "label-strong": "typo-label-strong",
  caption: "typo-caption",
  helper: "typo-helper",
  "table-header": "typo-table-header",
  "table-label": "typo-table-label",
  "table-value": "typo-table-value",
  "numeric-lg": "typo-numeric-lg",
  "numeric-md": "typo-numeric-md",
  "numeric-compact": "typo-numeric-compact",
  "numeric-sm": "typo-numeric-sm",
  wordmark: "typo-wordmark",
  "wordmark-sm": "typo-wordmark-sm",
} as const

export type TypographyVariant = keyof typeof typographyClasses

type TypographyProps<Tag extends React.ElementType = "span"> = {
  as?: Tag
  variant: TypographyVariant
} & Omit<React.ComponentPropsWithRef<Tag>, "as" | "variant">

export function Typography<Tag extends React.ElementType = "span">({
  as,
  variant,
  className,
  ...props
}: TypographyProps<Tag>) {
  const Component = as ?? "span"

  return (
    <Component
      data-slot="typography"
      {...props}
      className={cn(typographyClasses[variant], className)}
    />
  )
}
