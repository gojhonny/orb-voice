---
name: harness-maintenance
description: Use when adding or changing Orb Voice context, ADRs, rules, SPECs, skills, workflows, audits, hooks, guardrails, or other engineering-harness artifacts.
---

# Harness maintenance procedure

1. Identify whether the change is context, decision, constraint, scope, procedure, or check.
2. Update the smallest correct record type; avoid duplicating the same rule in prose.
3. Use the next stable number for ADRs, rules, and SPECs.
4. State prospective versus retrospective mode and use accurate dates.
5. Add or update deterministic audit evidence when possible.
6. Ensure every created directory has `readme.md`.
7. Run `./cli/orb-voice audit` and `./cli/orb-voice check`.

Do not add application state, generated transcripts, consumer data, or provider
credentials to the harness.
