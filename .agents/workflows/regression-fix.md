# Regression fix workflow

Use when a previously supported Orbo behavior fails or a deterministic test exposes a regression.

1. Read `AGENTS.md`, the relevant rules, and the closest existing SPEC/ADR.
2. Use the `context-engineering` skill to load only the affected concern.
3. Reproduce the failure with the smallest deterministic test or audit.
4. Create or update a SPEC that states the regression, expected behavior, and evidence.
5. Use the relevant domain skill (`web-components`, `voice-engineering`, or `accessibility`).
6. Add the failing colocated test before changing production behavior when feasible.
7. Implement the narrowest fix without weakening public compatibility or SSR safety.
8. Run the affected test directly, then `orbo test`.
9. Run `orbo check` before completion.
10. Record the commands and outcomes in the SPEC evidence section.

Do not suppress unhandled errors globally, bypass hooks, or weaken a guardrail merely to make a test green.
