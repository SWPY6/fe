import { afterEach, describe, expect, it, vi } from "vitest"

import type { FeedbackStore } from "./db/store"
import { formatFeedbackIssue, notifyFeedbackIssue } from "./github"
import { annotationSchema } from "./protocol"

const annotation = annotationSchema.parse({
  id: "feedback-build-2",
  sessionId: "ses_test",
  status: "pending",
  x: 12,
  y: 34,
  comment: "버튼 문구를 바꿔주세요\n설명이 필요합니다.",
  element: "button",
  elementPath: "main > button.primary",
  timestamp: Date.parse("2026-09-18T00:00:00.000Z"),
  createdAt: "2026-09-18T00:00:00.000Z",
  buildVersion: "production-2.1",
  url: "https://example.com/movers?tab=all",
  sourceFile: "src/hero.tsx:42",
})

function notificationStore() {
  return {
    claimGitHubNotification: vi
      .fn<FeedbackStore["claimGitHubNotification"]>()
      .mockResolvedValue(true),
    getGitHubNotification: vi.fn<FeedbackStore["getGitHubNotification"]>().mockResolvedValue({
      status: "sent",
      issueNumber: 80,
      issueUrl: "https://github.com/SWPY6/fe/issues/80",
    }),
    getSession: vi.fn<FeedbackStore["getSession"]>().mockResolvedValue({
      id: "ses_test",
      url: "https://example.com/movers",
      status: "active",
      createdAt: annotation.createdAt,
    }),
    saveGitHubNotification: vi
      .fn<FeedbackStore["saveGitHubNotification"]>()
      .mockResolvedValue(undefined),
  }
}

afterEach(() => vi.unstubAllGlobals())

describe("GitHub feedback notifications", () => {
  it("uses the saved comment, originating build, full URL and selector context", () => {
    const issue = formatFeedbackIssue(annotation, "https://example.com/movers")
    expect(issue.title).toBe("[화면 피드백] 버튼 문구를 바꿔주세요 설명이 필요합니다.")
    expect(issue.body).toContain(annotation.comment)
    expect(issue.body).toContain("production-2.1")
    expect(issue.body).toContain("https://example.com/movers?tab=all")
    expect(issue.body).toContain("main > button.primary")
    expect(issue.body).toContain("src/hero.tsx:42")
    expect(issue.body).toContain("feedback-build-2")
  })

  it("does not label old feedback as the current build", () => {
    expect(
      formatFeedbackIssue({ ...annotation, buildVersion: undefined }, "https://example.com").body,
    ).toContain("미기록 (기존 피드백)")
  })

  it("creates an issue with the server token and persists the returned link", async () => {
    const store = notificationStore()
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          number: 80,
          html_url: "https://github.com/SWPY6/fe/issues/80",
        }),
        { status: 201 },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await notifyFeedbackIssue(store, annotation, "server-only-token")

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/SWPY6/fe/issues",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer server-only-token" }),
        body: JSON.stringify(formatFeedbackIssue(annotation, "https://example.com/movers")),
      }),
    )
    expect(result).toEqual({
      status: "sent",
      issueNumber: 80,
      issueUrl: "https://github.com/SWPY6/fe/issues/80",
    })
    expect(store.saveGitHubNotification).toHaveBeenCalledWith(annotation.id, result)
  })

  it("does not create another issue when a retry or concurrent sync cannot claim it", async () => {
    const store = notificationStore()
    store.claimGitHubNotification.mockResolvedValue(false)
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal("fetch", fetchMock)

    expect(await notifyFeedbackIssue(store, annotation, "server-only-token")).toMatchObject({
      status: "sent",
      issueNumber: 80,
    })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(store.saveGitHubNotification).not.toHaveBeenCalled()
  })

  it("records an API failure and permits a later successful delivery", async () => {
    const store = notificationStore()
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("Forbidden", { status: 403 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ number: 81, html_url: "https://github.com/SWPY6/fe/issues/81" }),
          { status: 201 },
        ),
      )
    vi.stubGlobal("fetch", fetchMock)

    expect(await notifyFeedbackIssue(store, annotation, "server-only-token")).toEqual({
      status: "failed",
      error: "GitHub Issue creation failed: HTTP 403",
    })
    expect(await notifyFeedbackIssue(store, annotation, "server-only-token")).toMatchObject({
      status: "sent",
      issueNumber: 81,
    })
    expect(store.saveGitHubNotification).toHaveBeenCalledTimes(2)
  })
})
