import { cn } from "cn"
import * as React from "react"

function Input({
  className,
  type,
  variant = "outline",
  leadingIcon,
  ...props
}: React.ComponentProps<"input"> & {
  variant?: "outline" | "filled"
  leadingIcon?: React.ReactNode
}) {
  const input = (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border px-3 py-1 typo-body-sm text-foreground transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:typo-label file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        variant === "filled" ? "border-transparent bg-muted" : "border-input bg-background",
        leadingIcon != null && "pl-9",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  )

  return leadingIcon != null ? (
    <div className="relative w-full min-w-0">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground [&_svg]:size-4"
      >
        {leadingIcon}
      </span>
      {input}
    </div>
  ) : (
    input
  )
}

export { Input }
