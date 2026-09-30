import { z } from "zod"

import { annotationSchema } from "../server/protocol"

export const feedbackEndpoint = "/api/agentation"
const sessionResponseSchema = z.object({ id: z.string().min(1) })

export async function joinFeedbackSession(url: string, signal: AbortSignal) {
  const response = await fetch(`${feedbackEndpoint}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    signal,
  })
  if (!response.ok) throw new Error(`Feedback session failed: HTTP ${response.status}`)
  return sessionResponseSchema.parse(await response.json()).id
}

export async function resolveFeedback(id: string) {
  const response = await fetch(`${feedbackEndpoint}/annotations/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "resolved", resolvedBy: "human" }),
  })
  if (!response.ok) throw new Error(`Feedback resolve failed: HTTP ${response.status}`)
  return annotationSchema.parse(await response.json())
}
