import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { joinFeedbackSession, resolveFeedback } from "./api"

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
