# SPEC-034: Orbo product identity

- Status: Implemented for source; no publication in this change
- Created: 2026-09-24
- Updated: 2026-09-24
- Mode: Prospective
- Owner: Jonatas Sales

## Problem

The active package is Orb Voice / `orb-voice`. The canonical identity is now the product Orbo, distributed as the npm package `orbo-voice`.

## Scope

Rename active product, package, CLI, element, event, CSS, configuration, build, and GitHub metadata to the split identity. Keep version `1.1.1`. Do not publish, tag, deprecate, or merge. Do not rewrite historical ADR or SPEC bodies. Do not register `<orb-voice>` or `<orbo>` as aliases.

## Requirements

- The package name is `orbo-voice` and the version remains `1.1.1`.
- Repository and bugs metadata target `gojhonny/orbo`.
- The custom element is `<orb-o>`, registered by `defineOrbo`.
- Public types use `Orbo*` / `ORBO_*`, keeping `Voice` only for the voice domain.
- The binary is `orbo` at `./cli/orbo`. Consumer setup is `npx orbo-voice --setup`.
- Imports are `orbo-voice`, `orbo-voice/browser`, `orbo-voice/react-types`, `orbo-voice/standalone`, and `orbo-voice/index.css`.
- Events are `orbo-conversation-state-change`, `orbo-transcript`, `orbo-speaking-change`, and `orbo-talk-error`.
- Build files are `dist/orbo.js`, `dist/orbo.d.ts`, and `dist/standalone/orbo.js`.
- The release workflow publishes `orbo-voice` and invokes `orbo --help`.

## Acceptance criteria

- [x] `package.json` name is `orbo-voice` at version `1.1.1`.
- [x] `<orb-o>` registers through `defineOrbo` and does not register `<orb-voice>`.
- [x] `./cli/orbo check` passes.
- [x] `npm pack --dry-run` reports `name: orbo-voice` and includes `dist/orbo.js`, `dist/standalone/orbo.js`, and `cli/orbo`.
- [x] A temporary consumer of that tarball can import `orbo-voice/browser`, type `OrboElement`, call `defineOrbo()`, and run `orbo --help`.

## Evidence

- `./cli/orbo check` on 2026-09-24: lint (existing optional-chain warning in the configuration clone module), source and test typecheck, 52 tests in 19 suites, both builds, SemVer 1.1.1, and all audits.
- `npm pack --dry-run --ignore-scripts` reports `name: orbo-voice`, version `1.1.1`, filename `orbo-voice-1.1.1.tgz`, with `dist/orbo.js`, `dist/orbo.d.ts`, `dist/browser.js`, `dist/react-types.js`, `dist/standalone/orbo.js`, `dist/index.css`, and `cli/orbo`.
- A temporary install of that tarball registered `<orb-o>` through `orbo-voice/browser` and `defineOrbo()`, and `orbo --help` printed the Orbo installer.

## Related records

- ADRs: ADR-0025
- Rules: 001, 008, 011

## Compatibility and risks

This is a breaking public API rename. There is no `orb-voice` alias. `orbo-voice` is a new npm identity and does not replace the published `orb-voice` package. The release guard does not publish while the GitHub repository is still `gojhonny/orb-voice`.
