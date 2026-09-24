---
name: to-tickets
description: Use when a ready Orbo SPEC needs to be decomposed into vertical GitHub issues with explicit scope, acceptance evidence, and blocking edges.
disable-model-invocation: true
---

# To Tickets

Convert one prospective `ready` numbered spec into a dependency graph of tracer-bullet GitHub issues. Issues are execution units; the numbered spec remains the behavioral source of truth.

## Procedure

1. Read the complete spec, its referenced rules, context and ADRs. Confirm status `ready` and identify every acceptance criterion.
2. Inspect the current implementation and existing public seams. Prefer slices that produce independently observable behavior.
3. Decompose the work vertically: each ticket should cross the layers required for one demonstrable outcome rather than implementing one technology layer in isolation.
4. Use expand–migrate–contract only for wide mechanical changes that cannot remain green as ordinary vertical slices.
5. Give every ticket an explicit `Blocked by` section. The graph must have at least one unblocked frontier and no orphaned acceptance criterion.
6. Create GitHub issues in dependency order. Each issue links the canonical `.spec.md` path, names the public seam, contains checkable criteria and references its blockers.
7. Do not copy the entire spec into every issue, create speculative abstractions, or alter the parent spec while publishing tickets.

## Ticket contract

```markdown
## Spec

`.agents/specs/NNN-name.spec.md` — `SPEC-###`

## What to build

One narrow, complete and independently demonstrable outcome.

## Acceptance criteria

- [ ] Observable criterion
- [ ] Failure behavior
- [ ] Scoped validation

## Blocked by

- Issue references, or `None`.
```

## Completion criterion

Every spec criterion maps to at least one ticket, all blocking edges are explicit and acyclic, and an implementation agent can select an unblocked issue without needing the original conversation.
