import { useLocation } from "@tanstack/react-router"
import { Agentation } from "agentation"

import { feedbackEndpoint } from "./api"
import { buildVersion } from "./buildVersion"
import {
  useFeedbackNotification,
  useFeedbackSession,
  useResolveFeedbackMutation,
} from "./useFeedback"

export function FeedbackReview() {
  const pathname = useLocation({ select: (location) => location.pathname })
  return <FeedbackSession key={pathname} pathname={pathname} />
}

function FeedbackSession({ pathname }: { pathname: string }) {
  const url = new URL(pathname, window.location.origin).toString()
  const { data: sessionId, isPending, isError } = useFeedbackSession(url)
  const resolve = useResolveFeedbackMutation()
  const onAnnotationSync = useFeedbackNotification()

  if (isPending) return null

  if (isError) {
    return <div role="alert">화면 피드백을 불러올 수 없습니다.</div>
  }

  return (
    <Agentation
      endpoint={feedbackEndpoint}
      sessionId={sessionId}
      buildVersion={buildVersion}
      onAnnotationSync={onAnnotationSync}
      onAnnotationResolve={async (annotation) => {
        await resolve.mutateAsync(annotation.id)
      }}
    />
  )
}
