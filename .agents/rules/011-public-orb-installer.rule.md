---
description: Scopes the published Orb Voice binary, npx project setup, source-checkout launcher, package-manager detection, runtime payload, and consumer-install safety boundaries.
globs:
  - "package.json"
  - "cli/**"
  - "README.md"
---
# Rule 011: Public Orb Voice installer

- Effective: 2026-09-04
- Updated: 2026-09-19
- Priority: High
- Applies: `package.json`, `cli/**`, release documentation, and npm payload

1. The package exposes exactly one binary named `orb-voice`, implemented with POSIX shell.
2. The canonical npx form is `npx orb-voice --setup`; it performs explicit consumer project setup, not repository engineering operations.
3. Consumer setup requires an existing `package.json`, installs Orb Voice into `dependencies`, and never overwrites application source files.
4. Detect npm, pnpm, yarn, or bun from explicit input, `packageManager`, lockfiles, then npm as the fallback.
5. Install the same Orb Voice version that supplied the running CLI unless an explicit package specifier is provided.
6. Do not trigger consumer setup or repository launcher setup through `preinstall`, `install`, `postinstall`, or `prepare`.
7. Repository-only commands must reject execution when the CLI is running from the published package.
8. Package scripts must not duplicate Orb Voice commands. `pnpm:devPreinstall` is permitted only as a root-project local-install hook that provisions the managed source-checkout launcher; `setup` remains a recovery bridge and `prepack` remains a release gate.
9. `prepack` must delegate to `./cli/orb-voice check`.
10. `dist/`, `cli/`, and npm's standard root metadata are the only intentional package payload.
11. Source-checkout engineering documentation uses `orb-voice <command>` directly after local setup. It must not require `pnpm exec orb-voice`, `npm exec -- orb-voice`, or equivalent package-manager executable runners.
12. The root README is consumer implementation documentation for the Web Component and its public API. Repository setup, harness, Git, release, and contribution procedures belong in engineering documentation rather than the npm-facing README.
13. npx project setup is transient and separate from the source-checkout launcher. Installing Orb Voice as an application dependency does not provision the repository launcher and does not run repository setup.
