# OrbV engineering harness

This directory is the versioned engineering context for `orbv`.
It records product intent, durable decisions, mandatory rules, bounded changes,
and the evidence used to maintain the package.

## Reading order

1. Read the repository [`AGENTS.md`](../AGENTS.md).
2. Read [`context/readme.md`](./context/readme.md).
3. Find the relevant specification in [`specs/`](./specs/).
4. Read linked decisions in [`adrs/`](./adrs/) and constraints in [`rules/`](./rules/).
5. Use a procedure from [`skills/`](./skills/) when it matches the task.
6. Use an explicit sequence from [`workflows/`](./workflows/) for recurring regression, review, release, or harness work.
7. Run `./cli/orbv check`, which includes tests, builds, SemVer validation, and audits.

## Record types

- **Context** explains the current product, architecture, testing, voice, Git, and release model.
- **ADR** records a durable architectural decision and its consequences.
- **Rule** is an enforceable repository constraint.
- **SPEC** defines a bounded change with acceptance criteria and evidence.
- **Skill** is a reusable on-demand work procedure with activation frontmatter, not a product requirement.
- **Workflow** is an explicit user-invoked sequence that orchestrates existing skills, rules, and OrbV commands.
- **Prompt** is a starter for creating consistent harness records.

Records `ADR-0001` through `ADR-0006` and `SPEC-001` through `SPEC-007` are
retrospective reconstructions dated **2026-08-21**. Later records describe
current decisions and implementations and use their actual record date.
