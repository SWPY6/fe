---
name: to-spec
description: "Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed."
disable-model-invocation: true
---

Turn the current conversation and its supporting evidence into the active work description on the project's issue tracker. This is a context handoff, not a fixed document format. Do not interview the user; synthesize what is already known and expose any unresolved uncertainty instead of silently deciding it.

## Process

1. Gather the current conversation, referenced Issues and pull requests, relevant comments, research, designs, ADRs, and enough of the codebase to distinguish established facts from assumptions. Use the project's domain vocabulary where it exists.

2. Determine what a future teammate or agent needs to recover the work. Include only the parts that materially matter: the trigger or current condition, the observable outcome sought, constraints and evidence, decisions already made, unresolved uncertainty, meaningful boundaries or tradeoffs, and how completion can be demonstrated.

3. Match the evidence to the work:

   - For product work, describe a real affected actor and outcome when one exists.
   - For bugs, preserve observed and expected behavior, reproduction conditions, impact, and verification evidence.
   - For technical work, explain the system or collaboration pressure, constraints, and invariants.
   - For investigations, state the question, relevant evidence, and the decision or artifact expected.
   - For mechanical work, keep the description short when intent and verification are evident.

4. Write a standalone title and a natural, self-contained body. Choose the order, headings, prose, lists, examples, screenshots, or code fragments that best communicate this work. Stable file paths or interface names may be included when they genuinely constrain or accelerate the work. Do not invent a user, rationale, alternative, decision, or section to make the Issue look complete.

5. If the conversation refines an existing work item, update that item's body so the current intent and boundaries do not compete with an obsolete draft. Otherwise create a new item on the configured tracker. Link canonical supporting artifacts rather than copying them, while retaining enough local context for the work item to stand on its own.

Do not apply workflow or readiness labels unless the user or repository configuration explicitly requires them.
