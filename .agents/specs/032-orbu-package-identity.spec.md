# SPEC-032: Orbu package identity

- Status: Implemented for source; publication waits on owner approval
- Created: 2026-09-24
- Updated: 2026-09-24
- Mode: Prospective
- Owner: Jonatas Sales

## Problem

The live package still presents as Orb Voice (`orb-voice`, `<orb-voice>`, `defineOrbVoice`). The owner has selected Orbu as the package and product name. The custom element cannot be `<orbu>` because a custom element name must contain a hyphen. The runtime tag is `<orb-u>`.

## Scope

Rename the current product identity across active source, package metadata, the public CLI, imports, dist filenames, events, CSS tokens, installer snippets, audits, CI checks, and the consumer README.

The npm package is `orbu`. The only runtime element is `<orb-u>`. Public types use `Orbu*` / `ORBU_*`. Events are `orbu-*`. CSS classes are `.orbu-*` and custom properties are `--orbu-*`. GitHub metadata targets `gojhonny/orbu`.

Do not register `<orbu>` or `<orb-voice>`. Do not keep an `orb-voice` binary or dual-dispatch `orb-voice-*` events. Do not publish, deprecate `orb-voice`, reset the version from `1.1.1`, or rewrite historical SPEC and ADR bodies. Preserve the NeonGate preset, the homepage `https://neongate.com.br/docs/orbz/overview`, and internal `orb_*` / `ORB_*` shell helpers.

## Requirements

1. `package.json#name` is `orbu`. Repository and bugs URLs use `gojhonny/orbu`. Homepage stays `https://neongate.com.br/docs/orbz/overview`. Version stays `1.1.1`.
2. `ORBU_TAG_NAME` is `orb-u`. React intrinsics, queries, and docs match. `customElements.define` is not called with `orbu` or `orb-voice`.
3. The published binary is `orbu`. Consumer setup is `npx orbu --setup`. Engineering commands are `orbu <command>` and `./cli/orbu <command>`.
4. Consumer imports use `orbu`, `orbu/browser`, `orbu/react-types`, and `orbu/standalone`. Dist entries are `dist/orbu.js` and `dist/standalone/orbu.js`.
5. Public symbols use `Orbu*` / `ORBU_*` / `defineOrbu`. Provider adapter class names stay. Events are `orbu-transcript`, `orbu-talk-error`, `orbu-conversation-state-change`, and `orbu-speaking-change`.
6. Audits and release automation encode the Orbu contract. `@neongate-ai/orbz`, `orbv`, and `orb-voice` are not current aliases.

## Acceptance criteria

- [x] Package name, GitHub metadata, homepage, bin, and dist filenames match this specification.
- [x] `ORBU_TAG_NAME` is `orb-u`. React intrinsics, queries, and docs match. `<orbu>` is not registered.
- [x] Public CLI is `orbu`. `npx orbu --setup` routes to project setup.
- [x] Installer installs `orbu` and prints `import 'orbu/browser'` plus `<orb-u>`.
- [x] README, rules, context, skills, and audits describe Orbu and `<orb-u>` as current.
- [x] Historical SPECs and ADRs retain past names and are marked superseded where they mandated the old npm or element identity.
- [x] `./cli/orbu check` and `npm pack --dry-run` pass with package identity `orbu`. No publish and no version change.

## Evidence

- `./cli/orbu check` on 2026-09-24: lint (existing optional-chain warning in the configuration clone module), source and test typecheck, 52 tests in 19 suites, both builds, SemVer 1.1.1, and all audits.
- Dist entries are `dist/orbu.js`, `dist/orbu.d.ts`, and `dist/standalone/orbu.js`.
- `ORBU_TAG_NAME` is `orb-u`. Events are `orbu-*`.

## Related records

- ADR-0023 supersedes the npm, element, and public CLI decision in ADR-0022.
- SPEC-031 is superseded by this specification.
- Rules 001, 002, 008, 011.

## Compatibility and risks

This is a breaking public rename for consumers of `orb-voice`, `<orb-voice>`, `defineOrbVoice`, `orb-voice-*` events, and the `orb-voice` binary. `orbu` is a separate npm identity. The old package stays published until a later owner-approved deprecation. `<orbu>` is an invalid custom element name, so the tag is `<orb-u>` while imports and events use the `orbu` slug. Version `1.1.1` is unchanged because a downgrade fails the SemVer gate. The external documentation path still contains `/orbz/`.
