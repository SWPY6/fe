import { cn } from "cn"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"

function PaginationRoot({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="페이지 이동"
      data-slot="pagination"
      className={cn("mx-auto flex w-full items-center justify-center gap-3", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-3", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  children,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button asChild variant={isActive ? "outline" : "ghost"} size={size} className={className}>
      <a
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      >
        {children}
      </a>
    </Button>
  )
}

function PaginationPrevious({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-label="이전 페이지"
      data-slot="pagination-previous"
      size="default"
      {...props}
    >
      <ChevronLeftIcon />
      {children ?? "이전"}
    </Button>
  )
}

function PaginationNext({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-label="다음 페이지"
      data-slot="pagination-next"
      size="default"
      {...props}
    >
      {children ?? "다음"}
      <ChevronRightIcon />
    </Button>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">더 많은 페이지</span>
    </span>
  )
}

function PaginationStatus({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pagination-status"
      className={cn("typo-body-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export const Pagination = {
  Root: PaginationRoot,
  Content: PaginationContent,
  Link: PaginationLink,
  Item: PaginationItem,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  Ellipsis: PaginationEllipsis,
  Status: PaginationStatus,
}
