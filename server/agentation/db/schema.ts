import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

import type {
  AgentationEvent,
  Annotation,
  AnnotationStatus,
  Session,
  SessionStatus,
} from "../protocol"

export const sessions = sqliteTable(
  "agentation_sessions",
  {
    id: text().primaryKey(),
    url: text().notNull(),
    urlKey: text("url_key").notNull(),
    status: text().$type<SessionStatus>().notNull().default("active"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
    projectId: text("project_id"),
    metadata: text({ mode: "json" }).$type<NonNullable<Session["metadata"]>>(),
  },
  (table) => [uniqueIndex("agentation_sessions_url_key").on(table.urlKey)],
)

export const annotations = sqliteTable(
  "agentation_annotations",
  {
    id: text().primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    status: text().$type<AnnotationStatus>().notNull().default("pending"),
    timestamp: integer().notNull(),
    data: text({ mode: "json" }).$type<Annotation>().notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
  },
  (table) => [
    index("agentation_annotations_session_timestamp").on(table.sessionId, table.timestamp),
    index("agentation_annotations_status").on(table.status),
  ],
)

export const events = sqliteTable(
  "agentation_events",
  {
    sequence: integer().primaryKey({ autoIncrement: true }),
    type: text().$type<AgentationEvent["type"]>().notNull(),
    timestamp: text().notNull(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    payload: text({ mode: "json" }).$type<AgentationEvent["payload"]>().notNull(),
  },
  (table) => [index("agentation_events_session_sequence").on(table.sessionId, table.sequence)],
)
