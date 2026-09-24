# Repository rules

Rules are mandatory constraints for every Orb Voice change. Read all numbered rules
before editing public APIs, source layout, voice behavior, tests, Git hooks,
engineering CLI, harness files, or package metadata.

Numbered rules are stable identifiers. A rule change requires a SPEC and should
reference an ADR when it changes architecture. Current rules also require a
shell-only Orb Voice CLI, Conventional Commits, forward-only SemVer changes,
colocated Vitest suites, explicit npx project setup, and agent runtime guardrails.
