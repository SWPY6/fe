import { cn } from "cn"
import type { ComponentProps } from "react"

function HeaderRoot({ className, ...props }: ComponentProps<"header">) {
  return <header className={cn("w-full min-w-0", className)} {...props} />
}

function HeaderRow({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-x-3 py-5 sm:gap-x-10", className)} {...props} />
}

function HeaderLeft({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex shrink-0 items-center", className)} {...props} />
}

function HeaderMiddle({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("min-w-0 flex-1 sm:max-w-md", className)} {...props} />
}

function HeaderRight({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("ml-auto flex items-center gap-2", className)} {...props} />
}

function HeaderNavigation({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      className={cn("overflow-x-auto border-y border-muted-foreground/70", className)}
      {...props}
    />
  )
}

export const Header = {
  Root: HeaderRoot,
  Row: HeaderRow,
  Left: HeaderLeft,
  Middle: HeaderMiddle,
  Right: HeaderRight,
  Navigation: HeaderNavigation,
}
