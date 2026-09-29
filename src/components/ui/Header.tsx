import { cn } from "cn"
import type { ComponentProps } from "react"

function HeaderRoot({ className, ...props }: ComponentProps<"header">) {
  return (
    <header className={cn("mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-4", className)} {...props} />
  )
}

function HeaderRow({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-10 gap-y-3 py-5", className)}
      {...props}
    />
  )
}

function HeaderLeft({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-center", className)} {...props} />
}

function HeaderMiddle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("order-3 w-full min-w-0 sm:order-0 sm:max-w-md sm:flex-1", className)}
      {...props}
    />
  )
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

/**
 * 헤더의 배치만 담당합니다. 로고, 검색 상태, 버튼 동작, 메뉴 링크는 사용처에서 넣습니다.
 * Row 안에 Left/Middle/Right를 조합하고, 아래 메뉴는 Navigation에 넣습니다.
 * 각 영역은 필요한 경우에만 사용하며 기본 배치는 className으로 조정할 수 있습니다.
 */
export const Header = {
  Root: HeaderRoot,
  Row: HeaderRow,
  Left: HeaderLeft,
  Middle: HeaderMiddle,
  Right: HeaderRight,
  Navigation: HeaderNavigation,
}
