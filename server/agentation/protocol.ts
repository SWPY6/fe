import { z } from "zod"

const rectangleSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  })
  .strict()

export const annotationIntentSchema = z.enum(["fix", "change", "question", "approve"])
export const annotationSeveritySchema = z.enum(["blocking", "important", "suggestion"])
export const annotationStatusSchema = z.enum(["pending", "acknowledged", "resolved", "dismissed"])
export const sessionStatusSchema = z.enum(["active", "approved", "closed"])

export const threadMessageSchema = z
  .object({
    id: z.string().min(1),
    role: z.enum(["human", "agent"]),
    content: z.string().min(1),
    timestamp: z.number(),
  })
  .strict()

const annotationFields = {
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
  comment: z.string().min(1),
  element: z.string().min(1),
  elementPath: z.string().min(1),
  timestamp: z.number(),
  selectedText: z.string().optional(),
  boundingBox: rectangleSchema.optional(),
  nearbyText: z.string().optional(),
  cssClasses: z.string().optional(),
  nearbyElements: z.string().optional(),
  computedStyles: z.string().optional(),
  fullPath: z.string().optional(),
  accessibility: z.string().optional(),
  isMultiSelect: z.boolean().optional(),
  isFixed: z.boolean().optional(),
  reactComponents: z.string().optional(),
  sourceFile: z.string().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  frame: z
    .object({
      path: z.array(
        z.object({
          index: z.number(),
          id: z.string().optional(),
          url: z.string(),
        }),
      ),
      x: z.number(),
      y: z.number(),
      fixed: z.boolean(),
      boundingBox: rectangleSchema,
    })
    .optional(),
  drawingIndex: z.number().optional(),
  elementBoundingBoxes: z.array(rectangleSchema).optional(),
  kind: z.enum(["feedback", "placement", "rearrange"]).optional(),
  placement: z
    .object({
      componentType: z.string(),
      width: z.number(),
      height: z.number(),
      scrollY: z.number(),
      text: z.string().optional(),
    })
    .strict()
    .optional(),
  rearrange: z
    .object({
      selector: z.string(),
      label: z.string(),
      tagName: z.string(),
      originalRect: rectangleSchema,
      currentRect: rectangleSchema,
    })
    .strict()
    .optional(),
  sessionId: z.string().min(1).optional(),
  url: z.url().optional(),
  intent: annotationIntentSchema.optional(),
  severity: annotationSeveritySchema.optional(),
  status: annotationStatusSchema.optional(),
  thread: z.array(threadMessageSchema).optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
  resolvedAt: z.iso.datetime().optional(),
  resolvedBy: z.enum(["human", "agent"]).optional(),
  authorId: z.string().optional(),
  _syncedTo: z.string().optional(),
}

export const createAnnotationSchema = z.object(annotationFields).strict()

export const annotationSchema = z
  .object({
    ...annotationFields,
    sessionId: z.string().min(1),
    status: annotationStatusSchema,
    createdAt: z.iso.datetime(),
  })
  .strict()

export const updateAnnotationSchema = annotationSchema
  .pick({
    comment: true,
    status: true,
    resolvedAt: true,
    resolvedBy: true,
    intent: true,
    severity: true,
  })
  .partial()
  .strict()

export const addThreadMessageSchema = threadMessageSchema
  .omit({ id: true, timestamp: true })
  .strict()

export const sessionSchema = z
  .object({
    id: z.string().min(1),
    url: z.url(),
    status: sessionStatusSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime().optional(),
    projectId: z.string().min(1).optional(),
    metadata: z.record(z.string(), z.json()).optional(),
  })
  .strict()

export const createSessionSchema = sessionSchema.pick({ url: true, projectId: true }).strict()

export const actionRequestSchema = z
  .object({
    sessionId: z.string().min(1),
    annotations: z.array(annotationSchema),
    output: z.string().min(1),
    timestamp: z.iso.datetime(),
  })
  .strict()

export const requestActionSchema = actionRequestSchema.pick({ output: true }).strict()

export const agentationEventTypeSchema = z.enum([
  "session.created",
  "annotation.created",
  "annotation.updated",
  "annotation.deleted",
  "thread.message",
  "action.requested",
])

export const agentationEventPayloadSchema = z.union([
  sessionSchema,
  annotationSchema,
  threadMessageSchema,
  actionRequestSchema,
])

export const agentationEventSchema = z
  .object({
    type: agentationEventTypeSchema,
    timestamp: z.iso.datetime(),
    sessionId: z.string().min(1),
    sequence: z.number().int().nonnegative(),
    payload: agentationEventPayloadSchema,
  })
  .strict()

export type AnnotationIntent = z.infer<typeof annotationIntentSchema>
export type AnnotationSeverity = z.infer<typeof annotationSeveritySchema>
export type AnnotationStatus = z.infer<typeof annotationStatusSchema>
export type SessionStatus = z.infer<typeof sessionStatusSchema>
export type ThreadMessage = z.infer<typeof threadMessageSchema>
export type ThreadMessageInput = z.infer<typeof addThreadMessageSchema>
export type CreateAnnotation = z.infer<typeof createAnnotationSchema>
export type Annotation = z.infer<typeof annotationSchema>
export type UpdateAnnotation = z.infer<typeof updateAnnotationSchema>
export type Session = z.infer<typeof sessionSchema>
export type ActionRequest = z.infer<typeof actionRequestSchema>
export type AgentationEventType = z.infer<typeof agentationEventTypeSchema>
export type AgentationEventPayload = z.infer<typeof agentationEventPayloadSchema>
export type AgentationEvent = z.infer<typeof agentationEventSchema>
