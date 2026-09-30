import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

import type {
  FeedbackEvent,
  Annotation,
  AnnotationStatus,
  Session,
  SessionStatus,
  GitHubNotification,
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
    type: text().$type<FeedbackEvent["type"]>().notNull(),
    timestamp: text().notNull(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    payload: text({ mode: "json" }).$type<FeedbackEvent["payload"]>().notNull(),
  },
  (table) => [index("agentation_events_session_sequence").on(table.sessionId, table.sequence)],
)

export const githubNotifications = sqliteTable("feedback_github_notifications", {
  annotationId: text("annotation_id")
    .primaryKey()
    .references(() => annotations.id, { onDelete: "cascade" }),
  status: text().$type<GitHubNotification["status"]>().notNull(),
  issueNumber: integer("issue_number"),
  issueUrl: text("issue_url"),
  error: text(),
  updatedAt: text("updated_at").notNull(),
})
