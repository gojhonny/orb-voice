---
name: to-spec
description: Use when an owner-approved OrbV repository change needs to be synthesized into the next canonical numbered SPEC with acceptance criteria and evidence.
disable-model-invocation: true
---

# To Spec

Create or revise one canonical `SPEC-###` contract from the current owner decision and repository reality. The spec lives under `.agents/specs/` and follows `.agents/specs/template.md`; it is not replaced by a chat summary, issue or branch description.

## Procedure

1. Load `AGENTS.md`, `.agents/specs/workflow.md`, every applicable `alwaysApply` rule, scoped context and accepted ADRs.
2. Inspect the affected code, tests, package boundaries and current spec catalog before describing the desired change.
3. Resolve the next durable ID and mutable priority from `.agents/specs/readme.md`. Preserve the `.spec.md` suffix.
4. Define the observable problem, public boundary, actors, scope, implementation constraints, failure behavior and exclusions.
5. Choose the highest practical primary test seam. Add only secondary seams needed to localize failures.
6. Write checkable acceptance criteria and name the evidence required for each one. Sensitive-data fixtures are synthetic unless a separate approved rule allows otherwise.
7. Reference local procedures through `.agents/skills/<name>/SKILL.md`. Remote skill repositories may appear only as attribution or immutable historical evidence.
8. Update the catalog atomically with the new path and status.
9. Set a prospective spec to `ready` only after the owner has approved the behavioral contract. Unresolved material decisions keep it `draft`.

Do not invent product decisions, rewrite established ADRs inside the spec, or turn a file-by-file plan into the behavioral source of truth.

## Completion criterion

The spec and catalog agree, every affected boundary and durable constraint is referenced, the primary seam and failure behavior are explicit, and the first implementation slice is unblocked without relying on the authoring conversation.
