import { onlineManager, QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query"
import { useSyncExternalStore } from "react"
import type { ReactNode } from "react"
import { Toaster } from "sonner"

import { queryClient } from "./client"

const subscribe = (onChange: () => void) => onlineManager.subscribe(onChange)
const getOnline = () => onlineManager.isOnline()

export function QueryProvider({ children }: { children: ReactNode }) {
  const online = useSyncExternalStore(subscribe, getOnline)

  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        {!online && (
          <output aria-label="연결 상태 안내" className="block border-b p-3">
            오프라인 상태입니다. 연결되면 요청을 이어갑니다.
          </output>
        )}
        {children}
        <Toaster containerAriaLabel="알림" />
      </QueryErrorResetBoundary>
    </QueryClientProvider>
  )
}
