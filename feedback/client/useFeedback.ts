import { useMutation, useQuery } from "@tanstack/react-query"
import type { Annotation } from "agentation"
import { toast } from "sonner"

import { annotationSchema } from "../server/protocol"
import { joinFeedbackSession, resolveFeedback, retryFeedbackNotification } from "./api"

export function useFeedbackSession(url: string) {
  return useQuery({
    queryKey: ["feedback-session", url],
    throwOnError: false,
    queryFn: ({ signal }) => joinFeedbackSession(url, signal),
  })
}

export function useResolveFeedbackMutation() {
  return useMutation({
    mutationFn: resolveFeedback,
    onError: () => toast.error("피드백을 완료 처리하지 못했습니다. 다시 시도해주세요."),
  })
}

export function useFeedbackNotification() {
  const retry = useMutation({
    mutationFn: retryFeedbackNotification,
    onSuccess: (notification) => {
      if (notification.status === "sent") toast.success("GitHub Issue를 생성했습니다.")
    },
    onError: (_error, id) => showFailure(id),
  })

  function showFailure(id: string) {
    toast.error("피드백은 저장했지만 GitHub Issue를 생성하지 못했습니다.", {
      id: `feedback-notification-${id}`,
      duration: Infinity,
      action: { label: "재시도", onClick: () => retry.mutate(id) },
    })
  }

  return (value: Annotation) => {
    const result = annotationSchema.safeParse(value)
    if (result.success && result.data.githubNotification?.status === "failed") {
      showFailure(result.data.id)
    }
  }
}
