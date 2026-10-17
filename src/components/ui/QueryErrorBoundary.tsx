import { ErrorBoundary } from "@suspensive/react"
import type { ErrorBoundaryProps } from "@suspensive/react"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import type { ComponentProps } from "react"

type ShouldCatch = NonNullable<ComponentProps<typeof ErrorBoundary>["shouldCatch"]>

export function QueryErrorBoundary<TShouldCatch extends ShouldCatch>(
  props: Omit<ErrorBoundaryProps<TShouldCatch>, "onReset">,
) {
  const { reset } = useQueryErrorResetBoundary()

  return <ErrorBoundary {...props} onReset={reset} />
}
