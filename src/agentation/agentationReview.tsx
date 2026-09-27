import { useQuery } from "@tanstack/react-query"
import { Agentation } from "agentation"

const endpoint = "/api/agentation"

export function AgentationReview() {
  const url = new URL(window.location.pathname, window.location.origin).toString()
  const {
    data: sessionId,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["agentation-session", url],
    queryFn: async ({ signal }) => {
      // Joining the URL's existing session loads annotations from other browsers.
      const response = await fetch(`${endpoint}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal,
      })

      if (!response.ok) {
        throw new Error(`Agentation session failed with status ${response.status}`)
      }

      const session: unknown = await response.json()

      if (
        !session ||
        typeof session !== "object" ||
        !("id" in session) ||
        typeof session.id !== "string"
      ) {
        throw new Error("Agentation session response is invalid")
      }

      return session.id
    },
  })

  if (isPending) return null

  if (isError) {
    return <div role="alert">화면 피드백을 불러올 수 없습니다.</div>
  }

  return <Agentation endpoint={endpoint} sessionId={sessionId} />
}
