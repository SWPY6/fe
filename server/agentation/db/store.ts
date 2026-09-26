import { and, asc, desc, eq, gt, lt } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"

import type {
  AgentationEventPayload,
  AgentationEventType,
  Annotation,
  CreateAnnotation,
  Session,
  ThreadMessageInput,
  UpdateAnnotation,
} from "../protocol"
import {
  agentationEventSchema,
  annotationSchema,
  sessionSchema,
  threadMessageSchema,
} from "../protocol"
import { annotations, events, sessions } from "./schema"

function normalizeUrl(value: string) {
  const url = new URL(value)
  url.hash = ""
  url.search = ""

  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, "")
  }

  return url.toString()
}

function toSession(row: typeof sessions.$inferSelect): Session {
  return sessionSchema.parse({
    id: row.id,
    url: row.url,
    status: row.status,
    createdAt: row.createdAt,
    ...(row.updatedAt ? { updatedAt: row.updatedAt } : {}),
    ...(row.projectId ? { projectId: row.projectId } : {}),
    ...(row.metadata ? { metadata: row.metadata } : {}),
  })
}

function toAnnotation(row: typeof annotations.$inferSelect): Annotation {
  return annotationSchema.parse({
    ...row.data,
    id: row.id,
    sessionId: row.sessionId,
    status: row.status,
    timestamp: row.timestamp,
    createdAt: row.createdAt,
    ...(row.updatedAt ? { updatedAt: row.updatedAt } : {}),
  })
}

export function createAgentationStore(binding: D1Database) {
  const db = drizzle(binding)

  const pruneExpiredEvents = () =>
    db
      .delete(events)
      .where(lt(events.timestamp, new Date(Date.now() - 7 * 24 * 60 * 60 * 1_000).toISOString()))

  const emit = async (
    type: AgentationEventType,
    sessionId: string,
    payload: AgentationEventPayload,
  ) => {
    const timestamp = new Date().toISOString()
    const [row] = await db
      .insert(events)
      .values({ type, timestamp, sessionId, payload })
      .returning({ sequence: events.sequence })

    return agentationEventSchema.parse({
      type,
      timestamp,
      sessionId,
      sequence: row.sequence,
      payload,
    })
  }

  const getSession = async (id: string) => {
    const [row] = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1)
    return row ? toSession(row) : undefined
  }

  const getAnnotation = async (id: string) => {
    const [row] = await db.select().from(annotations).where(eq(annotations.id, id)).limit(1)
    return row ? toAnnotation(row) : undefined
  }

  const listSessionAnnotations = async (sessionId: string) => {
    const rows = await db
      .select()
      .from(annotations)
      .where(eq(annotations.sessionId, sessionId))
      .orderBy(asc(annotations.timestamp))
    return rows.map(toAnnotation)
  }

  return {
    async createOrGetSession(url: string, projectId?: string) {
      const urlKey = normalizeUrl(url)
      const id = `ses_${crypto.randomUUID()}`
      const createdAt = new Date().toISOString()
      const [created] = await db
        .insert(sessions)
        .values({ id, url: urlKey, urlKey, projectId, createdAt })
        .onConflictDoNothing({ target: sessions.urlKey })
        .returning()
      const row =
        created ?? (await db.select().from(sessions).where(eq(sessions.urlKey, urlKey)).limit(1))[0]

      if (!row) {
        throw new Error("Failed to create session")
      }

      const session = toSession(row)

      if (created) {
        await emit("session.created", session.id, session)
      }

      await pruneExpiredEvents()

      return session
    },

    async listSessions() {
      const rows = await db.select().from(sessions).orderBy(desc(sessions.createdAt))
      return rows.map(toSession)
    },

    getSession,

    async getSessionWithAnnotations(id: string) {
      const session = await getSession(id)

      if (!session) {
        return undefined
      }

      return { ...session, annotations: await listSessionAnnotations(id) }
    },

    async addAnnotation(sessionId: string, input: CreateAnnotation) {
      if (!(await getSession(sessionId))) {
        return undefined
      }

      const id = `ann_${crypto.randomUUID()}`
      const createdAt = new Date().toISOString()
      const annotation = annotationSchema.parse({
        ...input,
        id,
        sessionId,
        status: "pending",
        timestamp: input.timestamp ?? Date.now(),
        createdAt,
      })

      await db.insert(annotations).values({
        id,
        sessionId,
        status: annotation.status,
        timestamp: annotation.timestamp,
        data: annotation,
        createdAt,
      })
      await emit("annotation.created", sessionId, annotation)

      return annotation
    },

    getAnnotation,

    async updateAnnotation(id: string, input: UpdateAnnotation) {
      const existing = await getAnnotation(id)

      if (!existing) {
        return undefined
      }

      const updatedAt = new Date().toISOString()
      const status = input.status ?? existing.status
      const resolved = status === "resolved" || status === "dismissed"
      const annotation = annotationSchema.parse({
        ...existing,
        ...input,
        id: existing.id,
        sessionId: existing.sessionId,
        status,
        createdAt: existing.createdAt,
        updatedAt,
        ...(resolved && !input.resolvedAt ? { resolvedAt: updatedAt } : {}),
      })

      await db
        .update(annotations)
        .set({ status, data: annotation, updatedAt })
        .where(eq(annotations.id, id))
      await emit("annotation.updated", existing.sessionId, annotation)

      return annotation
    },

    async deleteAnnotation(id: string) {
      const annotation = await getAnnotation(id)

      if (!annotation) {
        return undefined
      }

      await db.delete(annotations).where(eq(annotations.id, id))
      await emit("annotation.deleted", annotation.sessionId, annotation)

      return annotation
    },

    async addThreadMessage(id: string, input: ThreadMessageInput) {
      const existing = await getAnnotation(id)

      if (!existing) {
        return undefined
      }

      const message = threadMessageSchema.parse({
        id: `msg_${crypto.randomUUID()}`,
        ...input,
        timestamp: Date.now(),
      })
      const thread = [...(existing.thread ?? []), message]
      const updatedAt = new Date().toISOString()
      const annotation = annotationSchema.parse({ ...existing, thread, updatedAt })

      await db
        .update(annotations)
        .set({ data: annotation, updatedAt })
        .where(eq(annotations.id, id))
      await emit("annotation.updated", existing.sessionId, annotation)
      await emit("thread.message", existing.sessionId, message)

      return annotation
    },

    async listPending(sessionId?: string) {
      const rows = sessionId
        ? await db
            .select()
            .from(annotations)
            .where(and(eq(annotations.status, "pending"), eq(annotations.sessionId, sessionId)))
            .orderBy(asc(annotations.timestamp))
        : await db
            .select()
            .from(annotations)
            .where(eq(annotations.status, "pending"))
            .orderBy(asc(annotations.timestamp))

      return rows.map(toAnnotation)
    },

    listSessionAnnotations,

    emit,

    async latestSequence() {
      const [row] = await db
        .select({ sequence: events.sequence })
        .from(events)
        .orderBy(desc(events.sequence))
        .limit(1)
      return row?.sequence ?? 0
    },

    async listEventsAfter(sequence: number, sessionId?: string) {
      const rows = await db
        .select({ event: events, sessionUrl: sessions.url })
        .from(events)
        .innerJoin(sessions, eq(events.sessionId, sessions.id))
        .where(
          sessionId
            ? and(gt(events.sequence, sequence), eq(events.sessionId, sessionId))
            : gt(events.sequence, sequence),
        )
        .orderBy(asc(events.sequence))
        .limit(100)

      return rows.map(({ event, sessionUrl }) => ({
        event: agentationEventSchema.parse({
          type: event.type,
          timestamp: event.timestamp,
          sessionId: event.sessionId,
          sequence: event.sequence,
          payload: event.payload,
        }),
        sessionUrl,
      }))
    },

    async listPendingWithSessionUrls() {
      const rows = await db
        .select({ annotation: annotations, sessionUrl: sessions.url })
        .from(annotations)
        .innerJoin(sessions, eq(annotations.sessionId, sessions.id))
        .where(eq(annotations.status, "pending"))
        .orderBy(asc(annotations.timestamp))

      return rows.map(({ annotation, sessionUrl }) => ({
        annotation: toAnnotation(annotation),
        sessionUrl,
      }))
    },
  }
}

export type AgentationStore = ReturnType<typeof createAgentationStore>
