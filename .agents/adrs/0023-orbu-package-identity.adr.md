# ADR-0023: Distribute Orbu as orbu and orb-u

- Status: Reverted by ADR-0024; npm rejected the unscoped package name
- Created: 2026-09-24
- Updated: 2026-09-24
- Mode: Prospective

## Context

ADR-0022 made `orb-voice` the npm package, public CLI, import path, and custom element `<orb-voice>`. The owner has selected Orbu as the product name and `orbu` as the npm package. The repository is `gojhonny/orbu`.

A custom element name must contain a hyphen, so `<orbu>` cannot be registered. The owner selected `<orb-u>`.

## Decision

Orbu is the current identity of this library:

- Brand: Orbu
- npm: `orbu`
- GitHub metadata: `gojhonny/orbu`
- Custom element: `<orb-u>` only
- Public CLI: `orbu`, with consumer setup `npx orbu --setup`
- Events: `orbu-*`
- CSS: `.orbu-*` and `--orbu-*`
- Public types: `Orbu*` and `ORBU_*`
- Version: remain `1.1.1`
- Homepage: `https://neongate.com.br/docs/orbz/overview`

Do not register `<orbu>` or `<orb-voice>`. Do not keep an `orb-voice` binary. Do not dual-dispatch `orb-voice-*` events. Internal POSIX helpers remain `orb_*` with `ORB_*` environment variables. The NeonGate preset remains `neongate`.

This supersedes the npm, element, and public CLI decision in ADR-0022.

## Consequences

Consumers install `orbu`, run `npx orbu --setup`, and render `<orb-u>`. Source-checkout engineering uses `orbu` and `./cli/orbu`. Historical SPECs and ADRs keep earlier names when they record past decisions. Publication and deprecation of `orb-voice` remain separate owner-approved operations. `orbu@1.1.1` is a new registry identity and does not replace an `orb-voice` release with the same version number.

## Evidence

- SPEC-032
- `package.json` name `orbu` at version `1.1.1`
- `.github/workflows/release.yml`

## Related records

- SPEC: SPEC-032
- Rules: 001, 002, 008, 011
- Supersedes: the npm, element, and public CLI decision in ADR-0022
