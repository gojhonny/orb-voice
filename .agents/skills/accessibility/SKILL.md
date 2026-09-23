---
name: accessibility
description: Use when changing Orb Voice accessibility semantics, reduced-motion behavior, host labeling guidance, transcripts, focus behavior, or assistive-technology expectations.
---

# Accessible Orb Voice change procedure

## Prerequisites

Read the relevant SPEC, ADR-0001, ADR-0003, and Rule 004.

## Procedure

1. Decide whether the host is decorative or meaningful in the consumer context.
2. Keep internal visual layers `aria-hidden`; expose no duplicate semantics.
3. Verify the consumer can provide an accessible host name and visible transcript.
4. Check `system`, `always`, and `never` reduced-motion modes.
5. Ensure state meaning is not communicated only through palette or animation.
6. Add public-contract tests; use a real browser for accessibility-tree or focus claims.
7. Run `./cli/orb-voice check` and record evidence in the SPEC.

## Stop conditions

Stop and request an ADR when a change adds built-in semantic content, live-region
behavior, focusability, or keyboard interaction to `<orb-voice>`.
