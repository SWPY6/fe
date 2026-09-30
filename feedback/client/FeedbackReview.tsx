import { Agentation } from "agentation"

import { feedbackEndpoint } from "./api"
import { buildVersion } from "./buildVersion"
import {
  useFeedbackNotification,
  useFeedbackSession,
  useResolveFeedbackMutation,
} from "./useFeedback"

export function FeedbackReview() {
  const url = new URL(window.location.pathname, window.location.origin).toString()
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
