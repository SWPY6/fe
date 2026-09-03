---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Reconcile the result with the originating GitHub work item before finishing. If implementation or review changed its accepted intent, boundaries, or decisions, update the active body and retain the discussion as history. Record verification evidence where the next teammate can find it.

Commit your work to the current branch. Write the commit as a context handoff whose length fits the change: preserve the motivation, actual choices, meaningful tradeoffs or uncertainty, and verification that the diff cannot reveal. A short message is enough for a self-evident mechanical change. Do not follow a fixed commit outline or mechanically list changed files.
