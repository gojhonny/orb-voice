# ADR-0020: Provision a direct Orb launcher for source checkouts

- Status: Accepted; public command spelling superseded by ADR-0021
- Created: 2026-09-09
- Updated: 2026-09-19
- Mode: Current decision

Public CLI identity is `orbv` (ADR-0021). This record remains the source-
checkout launcher decision; examples that say `orb` are historical spelling.

## Context

Orb is already the single engineering command surface, and the repository has a
managed user-scoped launcher that safely delegates to a configured checkout.
However, ordinary source setup did not provision that launcher automatically.
Active guidance therefore leaked package-manager executable-runner forms into the
engineering workflow even though the intended interface is the command itself:
`orb <command>`.

The package is also published to npm. A normal dependency lifecycle such as
`postinstall` would run for consuming applications and would be the wrong place
to mutate repository tooling or user launcher state.

## Decision

A local root pnpm install of the Orbz source checkout provisions the existing
managed launcher through `pnpm:devPreinstall`:

```text
./cli/orb setup --launcher --bootstrap
```

This lifecycle is source-checkout setup, not package-consumer setup. The launcher
continues to use the existing guarded destination selection and managed marker,
does not edit shell profiles, refuses unmanaged targets, and skips mutation when
bootstrap mode detects CI.

After source setup, the canonical engineering command surface is direct:

```text
orb doctor
orb test
orb check
```

`./cli/orb setup --launcher` remains a recovery path when launcher provisioning
was disabled, a checkout moved, or the launcher needs to be refreshed.

The standard npm dependency lifecycles `preinstall`, `install`, `postinstall`, and
`prepare` remain unused for Orb setup. Explicit npx project setup from ADR-0011
remains separate and does not provision the source-checkout engineering launcher.

This decision supersedes only the source-checkout invocation guidance in
ADR-0010 and ADR-0011. Their single-command-surface and explicit npx consumer
installer decisions remain in force.

## Consequences

Repository users get the intended `orb <command>` experience after the normal
source dependency installation instead of needing a package-manager executable
runner. Application consumers continue to receive a side-effect-free dependency
install with respect to Orb repository setup and user launcher state.

The selected launcher directory still needs to be on the user's `PATH`. Orb
reports a missing `PATH` entry but deliberately does not edit shell profiles.

## Evidence

- `package.json#scripts.pnpm:devPreinstall`
- `cli/src/commands/setup-launcher.sh`
- `cli/readme.md`
- `.audits/cli.audit.sh`
- `.audits/package.audit.sh`
- `.audits/documentation.audit.sh`
- SPEC-029

## Related records

- SPEC: SPEC-029
- Rules: 007, 008, 011
- Supersedes: source-checkout invocation guidance in ADR-0010 and ADR-0011
