# ADR-0011: Publish Orb as an explicit npx project installer

- Status: Accepted; source-checkout invocation amended by ADR-0020; public binary name superseded by ADR-0021
- Created: 2026-09-04
- Updated: 2026-09-19
- Mode: Current decision

OrbZ was later renamed to OrbV. The published binary is `orbv` and consumer
setup is `npx orbv --setup` (ADR-0021). This record remains historical evidence
of the explicit npx installer and the separation from repository commands.

## Context

Repository commands were duplicated between `package.json#scripts` and the Orb
CLI. That produced divergent command paths, including a broken `prepack` call to
a removed `check` script. Consumers also need a one-command way to add Orbz to
an existing project without turning package installation into an implicit setup
lifecycle.

## Decision

Orb is the canonical command surface for repository operations. Keep package
scripts limited to source-launcher setup/recovery and required npm lifecycle
gates; `prepack` delegates directly to `./cli/orb check`.

Publish `cli/orb` as the package's single `orb` binary and include `cli/` in the
intentional npm payload. When that binary runs outside an Orbz source checkout
with no arguments, it performs explicit consumer project setup:

1. require an existing target `package.json`;
2. detect npm, pnpm, yarn, or bun from package metadata and lockfiles;
3. add the executing Orbz version to project dependencies;
4. print a framework-neutral registration example;
5. never generate or overwrite application source files.

Do not use `preinstall`, `install`, `postinstall`, or `prepare` to trigger
consumer setup or source-repository launcher setup. Repository-only commands
reject execution from the distributed npm package. `npx` is transient and does
not promise a repository engineering launcher inside consuming applications.

ADR-0020 supersedes the older source-checkout invocation guidance: a local root
pnpm install provisions the managed user launcher through the root-only
`pnpm:devPreinstall` hook, and repository engineering commands are then invoked
directly as `orb <command>`.

## Consequences

`npx -y --package=@neongate-ai/orbz@latest orb` remains the canonical explicit
consumer project-setup invocation: it selects the published `orb` binary, fetches
the temporary installer, and adds Orbz to the current project. This is separate
from the source-checkout engineering launcher. Installing Orbz as an application
dependency does not provision repository tooling or mutate user launcher state.

The published payload intentionally includes shell CLI files in addition to
runtime distribution files. POSIX shell is required for the CLI, while the Web
Component package remains framework-agnostic.

ADR-0018 restores the existing published identity `@neongate-ai/orbz` after
ADR-0017's proposed npm migration, without changing this explicit installer
architecture. GitHub ownership remains `gojhonny/orbz`.

## Evidence

- `package.json#bin`
- `package.json#files`
- `package.json#scripts`
- `cli/orb`
- `cli/src/commands/setup-project.sh`
- `cli/src/commands/setup-launcher.sh`
- `.github/workflows/ci.yml`

## Related records

- ADR-0005, ADR-0007, ADR-0010, ADR-0017, ADR-0018, and ADR-0020
- SPEC-014, SPEC-026, SPEC-027, and SPEC-029
- Rules 001, 008, and 011
