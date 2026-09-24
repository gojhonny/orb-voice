# Change review workflow

Use for a pre-merge review of Orbo code, package, or harness changes.

1. Read `AGENTS.md`, the changed SPEC, and linked ADRs/rules.
2. Use the `code-review` skill.
3. Inspect public exports, attributes, properties, methods, events, and package payload changes first.
4. Verify SSR-safe imports and browser side effects remain isolated to the browser entry point.
5. Check Web Component lifecycle, closed-shadow behavior, reduced motion, voice cancellation, localization, and accessibility implications.
6. Confirm tests are colocated, deterministic, and exercise public behavior or justified factory internals.
7. Confirm docs, SPECs, ADRs, rules, audits, and CLI help remain synchronized.
8. Run `orbo lint`, `orbo typecheck`, and `orbo test` when reviewing executable changes.
9. Run `orbo check` before declaring the change release-ready.
10. Report findings by severity with exact file/behavior evidence.

## Formatting-only README changes

When the approved scope preserves copy, pin the base commit before editing and
compare the rendered Markdown semantics against that base: visible text and
punctuation, ordered heading labels, inline code, table cells, link labels and
destinations, and image sources/alternative text. Normalize presentation
whitespace only; compare fenced code and its language exactly. Do not silently
correct existing copy or update a URL as part of presentation work.

Keep native heading anchors and section order stable. Check that GitHub-supported
HTML remains balanced and does not hide instructions. Run the documentation
audit with `sh .audits/documentation.audit.sh`, then the complete Orbo gate. Record
the content comparison, review head and CI/deployment outcomes in the delivery
SPEC and PR. Keep temporary rendered comparisons outside tracked package files.
