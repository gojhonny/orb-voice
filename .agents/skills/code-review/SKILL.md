---
name: code-review
description: Use when reviewing Orb Voice changes for public API compatibility, SSR safety, Web Component lifecycle, voice cancellation, accessibility, tests, packaging, or harness compliance.
---

# Orb Voice code review procedure

1. Read the changed SPEC and linked ADRs/rules.
2. Review public API compatibility before implementation details.
3. Check SSR imports, browser-only side effects, and custom-element registration.
4. Check closed-shadow encapsulation, reduced motion, language, silence, and error events.
5. Inspect cancellation and stale async work in voice or animation code.
6. Confirm tests observe public behavior and include negative cases.
7. Confirm exports, package payload, docs, and audits remain synchronized.
8. Run `./cli/orb-voice check` and report findings by severity with file and behavior evidence.

Reject secrets, framework wrappers, implicit autoplay, mock product copy, and
changes that bypass the package entry-point contract.
