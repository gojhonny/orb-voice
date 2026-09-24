# SPEC-033: Restore Orb Voice package identity

- Status: Implemented for source; no publication in this change
- Created: 2026-09-24
- Updated: 2026-09-24
- Mode: Prospective
- Owner: Jonatas Sales

## Problem

Pull request #28 renamed the live package to Orbu. npm rejected the unscoped name `orbu` because it was too similar to an existing package. The published package identity to keep is `orb-voice`.

## Scope

Revert merge `9e7f4db00173a3baa145a523b4ab7aec5d824466` with `git revert -m 1` so the active tree matches the Orb Voice source from the merge's first parent. Keep that merge in history. Do not reset `main`, publish, deprecate, create tags, or create a GitHub release.

Keep ADR-0023 and SPEC-032 as historical records of the rejected rename, marked reverted. Do not keep Orbu aliases in the package, CLI, element, events, or imports.

## Requirements

1. `package.json#name` is `orb-voice`. Version stays `1.1.1`. Repository and bugs URLs use `gojhonny/orb-voice`.
2. The only custom element is `<orb-voice>`. Public registration is `defineOrbVoice`. Public types use `OrbVoice*` and `ORB_VOICE_*`.
3. The published binary is `orb-voice`. Consumer setup is `npx orb-voice --setup`.
4. Imports use `orb-voice`, `orb-voice/browser`, `orb-voice/react-types`, `orb-voice/standalone`, and `orb-voice/index.css`. Dist entries are `dist/orb-voice.js` and `dist/standalone/orb-voice.js`.
5. Events use the `orb-voice-*` protocol. Active source does not register `orbu` or `<orb-u>`.

## Acceptance criteria

- [x] The revert of merge `9e7f4db` restores the pre-Orbu tree before the historical-record additions.
- [x] Package name, bin, exports, repository, and bugs match `orb-voice` and `gojhonny/orb-voice`.
- [x] `<orb-voice>`, `defineOrbVoice`, and `orb-voice-*` events are the active contract.
- [x] ADR-0023 and SPEC-032 remain and are marked reverted by ADR-0024 and SPEC-033.
- [x] `./cli/orb-voice check` and `npm pack --dry-run` report package name `orb-voice`. No publish, tag, or release.

## Evidence

- Revert commit `b264f0b` of merge `9e7f4db00173a3baa145a523b4ab7aec5d824466` (`git revert -m 1`). No conflicts. The revert tree matches parent `97397d401c7eafe79143fc61dd98946faccf2c2a` before these historical records.
- `pnpm install --frozen-lockfile` on 2026-09-24.
- `./cli/orb-voice check`: lint (existing optional-chain warning in the configuration clone module), source and test typecheck, 52 tests in 19 suites, both builds, SemVer 1.1.1, and all audits.
- `npm pack --dry-run --ignore-scripts` reports `name: orb-voice`, version `1.1.1`, filename `orb-voice-1.1.1.tgz`, with `dist/orb-voice.js` and `dist/standalone/orb-voice.js`.
- `./cli/orb-voice --help` prints the Orb Voice engineering CLI.

## Related records

- ADR-0024 restores ADR-0022 and supersedes ADR-0023.
- SPEC-032 is reverted by this specification.
- Rules 001, 002, 008, 011.

## Compatibility and risks

npm currently lists `orb-voice@1.0.0`. This repository's source version remains `1.1.1`, which is the version already selected for the next Orb Voice release and is greater than the published `1.0.0`. This change does not publish that version. Consumers of the short-lived Orbu tree must return to `orb-voice` and `<orb-voice>`; no compatibility alias is provided.
