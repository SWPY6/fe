import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { cors } from "hono/cors"

import { createAgentationStore } from "./db/store"
import { openEventStream } from "./events"
import {
  actionRequestSchema,
  addThreadMessageSchema,
  createAnnotationSchema,
  createSessionSchema,
  requestActionSchema,
  updateAnnotationSchema,
} from "./protocol"

type AgentationEnv = {
  Bindings: {
    AGENTATION_DB?: D1Database
  }
  Variables: {
    store: ReturnType<typeof createAgentationStore>
  }
}

const app = new Hono<AgentationEnv>().basePath("/api/agentation")

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Accept", "Last-Event-ID"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
)

app.get("/health", (c) =>
  c.env.AGENTATION_DB
    ? c.json({ status: "ok", mode: "cloudflare-d1" })
    : c.json({ error: "AGENTATION_DB binding is not configured" }, 503),
)

app.use("*", async (c, next) => {
  if (!c.env.AGENTATION_DB) {
    return c.json({ error: "AGENTATION_DB binding is not configured" }, 503)
  }

  c.set("store", createAgentationStore(c.env.AGENTATION_DB))
  await next()
})

app.get("/status", (c) => c.json({ mode: "cloudflare-d1", storage: "d1", events: "sse" }))

app.post("/sessions", zValidator("json", createSessionSchema), async (c) => {
  const { url, projectId } = c.req.valid("json")
  const session = await c.var.store.createOrGetSession(url, projectId)
  return c.json(session, 201)
})

app.get("/sessions", async (c) => c.json(await c.var.store.listSessions()))

app.get("/sessions/:id", async (c) => {
  const session = await c.var.store.getSessionWithAnnotations(c.req.param("id"))
  return session ? c.json(session) : c.json({ error: "Session not found" }, 404)
})

app.post("/sessions/:id/annotations", zValidator("json", createAnnotationSchema), async (c) => {
  const annotation = await c.var.store.addAnnotation(c.req.param("id"), c.req.valid("json"))
  return annotation ? c.json(annotation, 201) : c.json({ error: "Session not found" }, 404)
})

app.get("/sessions/:id/pending", async (c) => {
  const annotations = await c.var.store.listPending(c.req.param("id"))
  return c.json({ count: annotations.length, annotations })
})

app.post("/sessions/:id/action", zValidator("json", requestActionSchema), async (c) => {
  const sessionId = c.req.param("id")
  const session = await c.var.store.getSession(sessionId)

  if (!session) {
    return c.json({ error: "Session not found" }, 404)
  }

  const annotations = await c.var.store.listSessionAnnotations(sessionId)
  const action = actionRequestSchema.parse({
    sessionId,
    annotations,
    output: c.req.valid("json").output,
    timestamp: new Date().toISOString(),
  })
  await c.var.store.emit("action.requested", sessionId, action)

  return c.json({
    success: true,
    annotationCount: annotations.length,
    delivered: { sseListeners: 0, webhooks: 0, total: 0 },
  })
})

app.get("/sessions/:id/events", async (c) => {
  const sessionId = c.req.param("id")
  return (await c.var.store.getSession(sessionId))
    ? openEventStream(c, c.var.store, sessionId)
    : c.json({ error: "Session not found" }, 404)
})

app.get("/annotations/:id", async (c) => {
  const annotation = await c.var.store.getAnnotation(c.req.param("id"))
  return annotation ? c.json(annotation) : c.json({ error: "Annotation not found" }, 404)
})

app.patch("/annotations/:id", zValidator("json", updateAnnotationSchema), async (c) => {
  const annotation = await c.var.store.updateAnnotation(c.req.param("id"), c.req.valid("json"))
  return annotation ? c.json(annotation) : c.json({ error: "Annotation not found" }, 404)
})

app.delete("/annotations/:id", async (c) => {
  const id = c.req.param("id")
  const annotation = await c.var.store.deleteAnnotation(id)
  return annotation
    ? c.json({ deleted: true, annotationId: id })
    : c.json({ error: "Annotation not found" }, 404)
})

app.post("/annotations/:id/thread", zValidator("json", addThreadMessageSchema), async (c) => {
  const annotation = await c.var.store.addThreadMessage(c.req.param("id"), c.req.valid("json"))
  return annotation ? c.json(annotation, 201) : c.json({ error: "Annotation not found" }, 404)
})

app.get("/pending", async (c) => {
  const annotations = await c.var.store.listPending()
  return c.json({ count: annotations.length, annotations })
})

app.get("/events", (c) => openEventStream(c, c.var.store))

app.notFound((c) => c.json({ error: "Not found" }, 404))

app.onError((reason, c) => {
  console.error("Agentation endpoint failed", reason)
  return c.json({ error: "Internal server error" }, 500)
})

export default app
