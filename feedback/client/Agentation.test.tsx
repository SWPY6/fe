import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRootRoute, createRoute, createRouter } from "@tanstack/react-router"
import { Agentation, getStorageKey, loadAnnotations } from "agentation"
import { toast, Toaster } from "sonner"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render } from "vitest-browser-react"
import { page } from "vitest/browser"

import { annotationSchema } from "../server/protocol"
import { resolveFeedback } from "./api"
import { FeedbackReview } from "./FeedbackReview"

const testPath = "/feedback-build-test"
let previousUrl: string
const previousStorage = new Map<string, string>()

beforeEach(() => {
  previousUrl = window.location.href
  window.history.replaceState(null, "", testPath)
  previousStorage.clear()
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("feedback-") || key.startsWith("agentation-")) {
      previousStorage.set(key, localStorage.getItem(key) ?? "")
      localStorage.removeItem(key)
    }
  }
  vi.stubGlobal(
    "EventSource",
    class extends EventTarget {
      close() {
        this.dispatchEvent(new Event("closed"))
      }
    },
  )
})

afterEach(async () => {
  await cleanup()
  toast.dismiss()
  vi.unstubAllGlobals()
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("feedback-") || key.startsWith("agentation-")) localStorage.removeItem(key)
  }
  for (const [key, value] of previousStorage) localStorage.setItem(key, value)
  window.history.replaceState(null, "", previousUrl)
})

test("build 4 shows build 2 feedback and Resolve persists status through PATCH", async () => {
  let annotation = annotationSchema.parse({
    id: "ann_build_2",
    sessionId: "ses_test",
    x: 30,
    y: 120,
    comment: "빌드 2의 피드백",
    element: "button",
    elementPath: "main > button",
    timestamp: Date.now(),
    createdAt: new Date().toISOString(),
    status: "pending",
    buildVersion: "preview-2.1",
  })
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
    if (init?.method === "PATCH") {
      annotation = {
        ...annotation,
        status: "resolved",
        resolvedBy: "human",
        resolvedAt: new Date().toISOString(),
      }
      return Response.json(annotation)
    }
    expect(String(input)).toContain("/sessions/ses_test")
    return Response.json({ id: "ses_test", url: window.location.href, annotations: [annotation] })
  })
  vi.stubGlobal("fetch", fetchMock)
  await render(
    <Agentation
      endpoint="/api/agentation"
      sessionId="ses_test"
      buildVersion="preview-4.1"
      onAnnotationResolve={async (value) => {
        await resolveFeedback(value.id)
      }}
    />,
  )

  await page.getByRole("button", { name: "Start feedback mode", exact: true }).click()
  const marker = page.getByRole("button", { name: "Edit annotation 1: button", exact: true })
  await marker.click()
  const resolveButton = page.getByRole("button", { name: "Resolve annotation" })
  await expect.element(resolveButton).toBeVisible()
  const actions = resolveButton.element().parentElement!
  actions.style.width = "220px"
  await page.getByRole("button", { name: "Resolve annotation" }).click()
  await expect.element(marker).not.toBeInTheDocument()
  expect(annotation.status).toBe("resolved")
  expect(annotation.buildVersion).toBe("preview-2.1")
  const patchRequest = fetchMock.mock.calls.find(([, options]) => options?.method === "PATCH")
  expect(JSON.parse(String(patchRequest?.[1]?.body))).toEqual({
    status: "resolved",
    resolvedBy: "human",
  })
  expect(fetchMock.mock.calls.some(([, options]) => options?.method === "DELETE")).toBe(false)
})

test("offline feedback keeps its creation build when resynced by a later build", async () => {
  let failSync = true
  const submittedBuilds: string[] = []
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>().mockImplementation(async (_input, init) => {
      if (init?.method === "POST") {
        const annotation = annotationSchema.parse({
          ...JSON.parse(String(init.body)),
          status: "pending",
          createdAt: new Date().toISOString(),
        })
        submittedBuilds.push(annotation.buildVersion ?? "")
        return failSync
          ? new Response("Offline", { status: 503 })
          : Response.json(annotation, { status: 201 })
      }
      return Response.json({ id: "ses_test", url: window.location.href, annotations: [] })
    }),
  )
  await render(
    <>
      <div data-testid="feedback-target" style={{ width: 240, height: 80, margin: 80 }}>
        테스트 대상
      </div>
      <Agentation endpoint="/api/agentation" sessionId="ses_test" buildVersion="preview-2.1" />
    </>,
  )
  await page.getByRole("button", { name: "Start feedback mode", exact: true }).click()
  await page.getByTestId("feedback-target").click()
  await page.getByRole("textbox").fill("빌드 2에서 작성")
  await page.getByRole("button", { name: "Add", exact: true }).click()
  await expect.poll(() => submittedBuilds).toEqual(["preview-2.1"])
  await expect.poll(() => loadAnnotations(testPath)[0]?.buildVersion).toBe("preview-2.1")
  expect(localStorage.getItem(getStorageKey(testPath))).toContain("preview-2.1")
  await cleanup()
  failSync = false
  await render(
    <Agentation endpoint="/api/agentation" sessionId="ses_test" buildVersion="preview-4.1" />,
  )
  await expect.poll(() => submittedBuilds).toEqual(["preview-2.1", "preview-2.1"])
})

test("reloading saved feedback restores the failed notification and its retry action", async () => {
  const annotation = annotationSchema.parse({
    id: "ann_failed_notification",
    sessionId: "ses_test",
    x: 30,
    y: 120,
    comment: "알림 전송에 실패한 피드백",
    element: "button",
    elementPath: "main > button",
    timestamp: Date.now(),
    createdAt: new Date().toISOString(),
    status: "pending",
    buildVersion: "preview-2.1",
    githubNotification: { status: "failed", error: "GitHub unavailable" },
  })
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => {
    const url = String(input)
    if (url.endsWith("/notification")) {
      return Response.json({
        status: "sent",
        issueNumber: 80,
        issueUrl: "https://github.com/SWPY6/fe/issues/80",
      })
    }
    if (url.endsWith("/sessions")) return Response.json({ id: "ses_test" })
    return Response.json({ id: "ses_test", url: window.location.href, annotations: [annotation] })
  })
  vi.stubGlobal("fetch", fetchMock)
  const queryClient = new QueryClient()
  const rootRoute = createRootRoute()
  const feedbackRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: testPath,
    component: FeedbackReview,
  })
  const router = createRouter({ routeTree: rootRoute.addChildren([feedbackRoute]) })
  await render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </QueryClientProvider>,
  )

  await expect
    .element(page.getByText("피드백은 저장했지만 GitHub Issue를 생성하지 못했습니다."))
    .toBeVisible()
  await page.getByRole("button", { name: "Start feedback mode", exact: true }).click()
  await page.getByRole("button", { name: "재시도", exact: true }).click()
  await expect.element(page.getByText("GitHub Issue를 생성했습니다.")).toBeVisible()
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/agentation/annotations/ann_failed_notification/notification",
    { method: "POST" },
  )
  queryClient.clear()
})
