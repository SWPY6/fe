import { useId, useState } from "react"
import { Button } from "../ui/Button"

type HeaderProps = {
  initialQuery?: string
  onSearch?: (query: string) => void
  onNotifications?: () => void
  onLogin?: () => void
  onSignUp?: () => void
}

export function Header({
  initialQuery = "",
  onSearch,
  onNotifications,
  onLogin,
  onSignUp,
}: HeaderProps) {
  const [query, setQuery] = useState(initialQuery)
  const [message, setMessage] = useState("")
  const id = useId()
  return (
    <header className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <a
          href="/"
          className="rounded-sm text-xl font-bold tracking-widest text-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          PLOUTOS
        </a>
        <search className="min-w-0 flex-1">
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (onSearch) onSearch(query.trim())
              else setMessage("검색 화면 예시입니다. 실제 종목 검색은 제공하지 않습니다.")
            }}
          >
            <div className="min-w-0 flex-1">
              <label htmlFor={id} className="mb-1 block text-xs text-muted-foreground">
                종목명 또는 티커 검색 · 데모
              </label>
              <input
                id={id}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="예: 예시전자, DEMO01"
                className="min-h-10 w-full rounded-lg border bg-background px-3 focus-visible:outline-2 focus-visible:outline-ring"
              />
            </div>
            <Button type="submit">검색</Button>
          </form>
        </search>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              onNotifications
                ? onNotifications()
                : setMessage("알림 화면 예시입니다. 실제 알림은 발송되지 않습니다.")
            }
          >
            🔔
          </Button>
          <Button
            onClick={() =>
              onLogin
                ? onLogin()
                : setMessage("로그인 화면 예시입니다. 실제 인증은 제공하지 않습니다.")
            }
          >
            로그인
          </Button>
          <Button
            onClick={() =>
              onSignUp
                ? onSignUp()
                : setMessage("회원가입 화면 예시입니다. 계정을 생성하지 않습니다.")
            }
          >
            회원가입
          </Button>
        </div>
      </div>
      <output className="block text-sm text-muted-foreground">
        {message || "프로토타입 · 검색 및 계정 액션은 화면 확인용입니다."}
      </output>
    </header>
  )
}
