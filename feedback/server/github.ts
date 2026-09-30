import { z } from "zod"

import type { FeedbackStore } from "./db/store"
import type { Annotation, GitHubNotification } from "./protocol"

const issuesEndpoint = "https://api.github.com/repos/SWPY6/fe/issues"
const githubIssueSchema = z.object({ number: z.number().int().positive(), html_url: z.url() })

export function formatFeedbackIssue(annotation: Annotation, sessionUrl: string) {
  const context = [
    ["배포 버전", annotation.buildVersion ?? "미기록 (기존 피드백)"],
    ["화면", annotation.url ?? sessionUrl],
    ["작성 시각", new Date(annotation.timestamp).toISOString()],
    ["대상 요소", annotation.element],
    ["요소 경로", annotation.elementPath],
    ["선택 텍스트", annotation.selectedText],
    ["주변 텍스트", annotation.nearbyText],
    ["React 컴포넌트", annotation.reactComponents],
    ["소스 위치", annotation.sourceFile],
  ]
    .filter(([, value]) => value)
    .map(([name, value]) => `- **${name}**: ${value}`)
    .join("\n")

  return {
    title: `[화면 피드백] ${annotation.comment.replace(/\s+/g, " ").slice(0, 100)}`,
    body: `${annotation.comment}\n\n### 작성 맥락\n\n${context}\n\n피드백 ID: \`${annotation.id}\``,
  }
}

export async function notifyFeedbackIssue(
  store: Pick<
    FeedbackStore,
    "claimGitHubNotification" | "getGitHubNotification" | "getSession" | "saveGitHubNotification"
  >,
  annotation: Annotation,
  token: string | undefined,
) {
  if (!(await store.claimGitHubNotification(annotation.id))) {
    return store.getGitHubNotification(annotation.id)
  }

  let notification: GitHubNotification

  try {
    if (!token) throw new Error("GITHUB_API_TOKEN binding is not configured")

    const session = await store.getSession(annotation.sessionId)
    if (!session) throw new Error("Feedback session not found")

    const response = await fetch(issuesEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2026-03-10",
        "User-Agent": "swpy6-feedback",
      },
      body: JSON.stringify(formatFeedbackIssue(annotation, session.url)),
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) throw new Error(`GitHub Issue creation failed: HTTP ${response.status}`)

    const issue = githubIssueSchema.parse(await response.json())
    notification = { status: "sent", issueNumber: issue.number, issueUrl: issue.html_url }
  } catch (error) {
    notification = {
      status: "failed",
      error: error instanceof Error ? error.message : "GitHub Issue creation failed",
    }
    console.error("Feedback GitHub notification failed", annotation.id, notification.error)
  }

  await store.saveGitHubNotification(annotation.id, notification)
  return notification
}
