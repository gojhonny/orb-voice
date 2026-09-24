---
name: implement
description: Use when implementing an approved Orb Voice SPEC or regression fix and you need a disciplined path from reproduction and tests through the narrowest production change and validation.
---

# Orb Voice implementation procedure

1. Reproduce the problem and confirm the relevant public contract.
2. Add or refine acceptance tests before changing behavior.
3. Implement through the narrowest existing layer: pure core, port, adapter, service, factory, or entry point.
4. Preserve SSR safety and isolate registration side effects.
5. Update types, exports, README, harness records, and audits together when their contracts change.
6. Run focused tests, then `./cli/orb-voice check`.
7. Inspect `npm pack --dry-run` for release-oriented changes.

Do not create framework wrappers or access the closed shadow tree from tests.
