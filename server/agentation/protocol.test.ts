import type { Annotation as AgentationAnnotation } from "agentation"
import { describe, expect, expectTypeOf, it } from "vitest"

import {
  addThreadMessageSchema,
  agentationEventSchema,
  annotationSchema,
  createAnnotationSchema,
  createSessionSchema,
  updateAnnotationSchema,
} from "./protocol"
import type { Annotation, CreateAnnotation } from "./protocol"

const clientAnnotation = {
  id: "client-annotation",
  x: 12,
  y: 34,
  comment: "버튼 문구를 바꿔주세요",
  element: "button",
  elementPath: "main > button.primary",
  timestamp: 1_726_643_200_000,
  reactComponents: "App > Hero > Button",
  sourceFile: "src/hero.tsx:42",
  attributes: { "data-testid": "primary-button" },
  frame: {
    path: [{ index: 0, url: "https://example.com/embed" }],
    x: 0,
    y: 0,
    fixed: false,
    boundingBox: { x: 0, y: 0, width: 100, height: 50 },
  },
}

describe("Agentation protocol", () => {
  it("accepts every declared Agentation selector context field", () => {
    const annotation = createAnnotationSchema.parse(clientAnnotation)

    expect(annotation.reactComponents).toBe("App > Hero > Button")
    expect(annotation.sourceFile).toBe("src/hero.tsx:42")
    expect(annotation.attributes).toEqual({ "data-testid": "primary-button" })
    expect(annotation.frame?.path[0]?.url).toBe("https://example.com/embed")
    expectTypeOf<CreateAnnotation>().toMatchTypeOf<AgentationAnnotation>()
    expectTypeOf<Annotation>().toMatchTypeOf<AgentationAnnotation>()
  })

  it("rejects undeclared fields instead of widening the annotation type", () => {
    expect(
      createAnnotationSchema.safeParse({
        ...clientAnnotation,
        reactComponets: "misspelled field",
      }).success,
    ).toBe(false)
  })

  it("rejects invalid sessions and empty comments", () => {
    expect(createSessionSchema.safeParse({ url: "not-a-url" }).success).toBe(false)
    expect(
      createAnnotationSchema.safeParse({
        id: "client-annotation",
        x: 0,
        y: 0,
        comment: "",
        element: "button",
        elementPath: "button",
        timestamp: 1_726_643_200_000,
      }).success,
    ).toBe(false)
  })

  it("validates stored annotations and event payloads with the same schemas", () => {
    const annotation = annotationSchema.parse({
      ...clientAnnotation,
      sessionId: "ses_test",
      status: "pending",
      createdAt: "2026-09-18T00:00:00.000Z",
    })

    expect(
      agentationEventSchema.safeParse({
        type: "annotation.created",
        timestamp: "2026-09-18T00:00:00.000Z",
        sessionId: "ses_test",
        sequence: 1,
        payload: annotation,
      }).success,
    ).toBe(true)
    expect(
      agentationEventSchema.safeParse({
        type: "annotation.created",
        timestamp: "2026-09-18T00:00:00.000Z",
        sessionId: "ses_test",
        sequence: 1,
        payload: { arbitrary: true },
      }).success,
    ).toBe(false)
  })

  it("accepts agent status changes and thread replies", () => {
    expect(
      updateAnnotationSchema.safeParse({ status: "resolved", resolvedBy: "agent" }).success,
    ).toBe(true)
    expect(
      addThreadMessageSchema.safeParse({ role: "agent", content: "수정했습니다" }).success,
    ).toBe(true)
  })

  it("does not allow immutable annotation fields to be overwritten", () => {
    expect(updateAnnotationSchema.safeParse({ id: "other-id" }).success).toBe(false)
    expect(updateAnnotationSchema.safeParse({ sessionId: "other-session" }).success).toBe(false)
  })
})
