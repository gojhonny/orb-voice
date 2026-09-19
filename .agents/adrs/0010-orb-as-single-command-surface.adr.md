# ADR-0010: Use Orb as the single engineering command surface

- Status: Accepted; amended by ADR-0011, ADR-0020, and ADR-0021
- Created: 2026-09-04
- Updated: 2026-09-19
- Mode: Current decision

Public command spelling is now `orbv` (ADR-0021). This record remains the
single-command-surface decision; examples that say `orb` are historical spelling.

## Context

The repository exposed the same engineering operations through both package
scripts and the Orb CLI. This produced ambiguous invocations such as `pnpm orb cleanup`, duplicated
orchestration, and allowed lifecycle hooks to reference a package script that
maintainers could reasonably remove. The failed `prepack` call to `pnpm check`
demonstrated that the two command surfaces could drift.

A fresh checkout needs a managed user-scoped `orb` launcher. Package publication
also benefits from an automatic validation lifecycle without exposing repository
commands as package-script aliases.

## Decision

Orb is the sole command surface for linting, type checking, tests, coverage,
builds, audits, harness reconciliation, Git gates, cleanup, diagnosis, and the
complete check.

`package.json` does not duplicate those engineering commands. The `prepack`
lifecycle remains as a non-interactive safety adapter and delegates directly to
`./cli/orb check`. CI and Husky call the checked-in CLI rather than package-script
aliases.

ADR-0020 provisions the existing managed source-checkout launcher from the local
root pnpm setup lifecycle. After source setup, the canonical human and agent
interface is `orb <command>` directly. The checked-in `./cli/orb` path remains a
recovery and automation implementation detail.

## Consequences

Command behavior has one implementation and one help surface. Removing a
redundant package alias cannot break the release gate, and repository users no
longer need a package-manager command wrapper to invoke Orb.

The original distribution boundary kept the CLI engineering-only and outside the
npm payload. ADR-0011 supersedes that narrow portion by publishing the same POSIX
shell entry point as an explicit npx installer while keeping repository-only
commands guarded. ADR-0020 separately defines source-checkout launcher setup and
does not turn application dependency installation into repository setup.

## Evidence

- `package.json#scripts`
- `cli/src/orb.sh`
- `cli/src/commands/`
- `.github/workflows/ci.yml`
- `.audits/cli.audit.sh`
- `.audits/package.audit.sh`

## Related records

- ADR-0007, ADR-0008, ADR-0011, and ADR-0020
- SPEC-012 and SPEC-029
- Rules 006, 008, 009, and 011
