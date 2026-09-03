# Preparing an agent-ready work item

An agent-ready Issue or pull request is the active context handoff for the next teammate or
agent. Consolidate the current understanding into its description instead of posting a second
fixed-format contract that competes with an obsolete body. Preserve the original report's
useful observations and keep the discussion as decision history.

If the description cannot be edited, post one clearly identified current-context comment and
link it from the latest triage comment.

## Quality bar

Write enough for a reader who missed the original discussion to recover the work's intent and
determine whether it is complete. Use the structure and length that fit this work. Preserve
only information that materially affects it:

- the observation, request, or pressure that prompted the work;
- the observable outcome sought;
- confirmed evidence and relevant constraints;
- decisions already made and uncertainty still open;
- meaningful scope boundaries or tradeoffs; and
- the test, reproduction, measurement, demonstration, or artifact that establishes completion.

Match the evidence to the work. Bugs need observed and expected behavior, reproduction
conditions, impact, and verification. Product work should name a real affected actor and
outcome when one exists. Technical work should explain the system or collaboration pressure,
constraints, and invariants. Investigations should preserve the question, evidence standard,
and expected decision or artifact.

Stable interfaces, types, configuration shapes, paths, or code fragments may be named when
they genuinely constrain or accelerate the work. Avoid brittle line numbers and procedural
instructions when the implementation remains open.

Do not invent a user, rationale, alternative, category, boundary, or section merely to make
the work item look complete. A self-evident mechanical change can be brief.

## Reconciliation

Before applying a ready state, read the full description and discussion. Resolve competing
statements in favor of the latest maintainer decision, update the active description, and
leave older comments as history. Link canonical research, designs, related Issues, pull
requests, and decision records instead of duplicating them, while retaining enough local
context for this work item to stand on its own.

For a pull request, describe the state of the existing diff and the remaining outcome rather
than pretending the work starts from nothing. When the work is implemented, the PR and squash
commit should carry the actual choices, deviations, and verification that the diff cannot
reveal.
