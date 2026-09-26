/* oxlint-disable no-await-in-loop -- SSE writes and polling must preserve event order. */

import type { Context } from "hono"
import { streamSSE } from "hono/streaming"

import type { AgentationStore } from "./db/store"

function hostMatches(url: string, domain?: string) {
  return !domain || new URL(url).host === domain
}

export function openEventStream(c: Context, store: AgentationStore, sessionId?: string) {
  const domain = sessionId ? undefined : c.req.query("domain")
  const isAgent = c.req.query("agent") === "true"
  const lastEventId = c.req.header("Last-Event-ID")

  return streamSSE(c, async (stream) => {
    await stream.write(`: connected${domain ? ` to domain ${domain}` : ""}\n\n`)

    let cursor = lastEventId ? Number.parseInt(lastEventId, 10) || 0 : await store.latestSequence()

    if (!sessionId && isAgent && !lastEventId) {
      const pending = (await store.listPendingWithSessionUrls()).filter(({ sessionUrl }) =>
        hostMatches(sessionUrl, domain),
      )

      for (const { annotation } of pending) {
        await stream.writeSSE({
          event: "annotation.created",
          id: "0",
          data: JSON.stringify({
            type: "annotation.created",
            timestamp: annotation.createdAt,
            sessionId: annotation.sessionId,
            sequence: 0,
            payload: annotation,
          }),
        })
      }

      await stream.writeSSE({
        event: "sync.complete",
        data: JSON.stringify({
          domain: domain ?? "all",
          count: pending.length,
          timestamp: new Date().toISOString(),
        }),
      })
    }

    let lastHeartbeat = Date.now()

    while (!stream.aborted) {
      const rows = await store.listEventsAfter(cursor, sessionId)

      for (const { event, sessionUrl } of rows) {
        cursor = Math.max(cursor, event.sequence)

        if (!hostMatches(sessionUrl, domain)) {
          continue
        }

        await stream.writeSSE({
          event: event.type,
          id: String(event.sequence),
          data: JSON.stringify(event),
        })
      }

      if (Date.now() - lastHeartbeat >= 15_000) {
        await stream.write(": ping\n\n")
        lastHeartbeat = Date.now()
      }

      await stream.sleep(rows.length === 100 ? 0 : 1_000)
    }
  })
}
