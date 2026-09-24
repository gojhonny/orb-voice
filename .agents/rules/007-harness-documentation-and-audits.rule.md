---
description: Scopes Orbu engineering-harness records, navigation, deterministic audits, accurate dates, terminology, and documentation synchronization.
globs:
  - ".agents/**"
  - ".audits/**"
  - "AGENTS.md"
  - "README.md"
---
# Rule 007: Harness, documentation, and audits

- Effective: 2026-08-21
- Priority: High
- Applies: `.agents/**`, `.audits/**`, repository documentation

1. Every directory under `.agents/` and `.audits/` contains a `readme.md`.
2. Harness records describe Orbu only and must not retain unrelated product-domain terminology.
3. ADRs and SPECs state whether they are prospective or retrospective.
4. New behavior starts with a SPEC; architectural changes link an ADR; constraints link rules.
5. Audits are deterministic POSIX shell scripts with no network requirement.
6. Audit failures explain the violated invariant and exit nonzero.
7. The root README remains the primary package getting-started document.
8. Keep record dates accurate; do not falsify source-control history.
