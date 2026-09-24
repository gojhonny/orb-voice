# ADR-0025: Make Orbo the product and orbo-voice the npm package

- Status: Accepted
- Created: 2026-09-24
- Updated: 2026-09-24
- Mode: Prospective

## Context

ADR-0024 restored Orb Voice after npm rejected the unscoped `orbu` name. The owner has now selected a split identity: the product, runtime, and public API are Orbo, while the npm distribution name is `orbo-voice`. The custom element must contain a hyphen, so it is `<orb-o>` rather than `<orbo>`.

The GitHub repository target is `gojhonny/orbo`. Renaming the GitHub repository is a separate owner action.

## Decision

Orbo is the canonical product identity. The npm package name is the distribution exception:

- Brand: Orbo
- npm: `orbo-voice`
- GitHub metadata: `gojhonny/orbo`
- Custom element: `<orb-o>` only
- Public CLI: `orbo`, with consumer setup `npx orbo-voice --setup`
- Events: `orbo-*`
- CSS: `.orbo-*` and `--orbo-*`
- Configuration file: `src/orbo.config.json`
- Build artifacts: `dist/orbo.js` and `dist/standalone/orbo.js`
- Public types: `Orbo*` and `ORBO_*`, including `defineOrbo`
- Version: remain `1.1.1`

`Voice` stays in a symbol only when it names the voice domain, as in `OrboVoiceEnginePort`. Do not register `<orbo>` or `<orb-voice>`. Do not keep an `orb-voice` binary, import path, or event alias. Do not publish the package name `orbo`. Internal POSIX helpers remain `orb_*` with `ORB_*` environment variables, and `cli/src/orb.sh` remains the shell implementation behind `cli/orbo`. The NeonGate preset remains `neongate`. The homepage remains `https://neongate.com.br/docs/orbz/overview`.

This supersedes ADR-0024. Publication, deprecation, tags, and GitHub releases are not part of this rename.

## Consequences

Active source, package metadata, the CLI, audits, and consumer documentation use the split identity. Historical ADRs and SPECs keep Orb Voice, OrbV, and Orbu when they record those decisions. The release workflow publishes `orbo-voice` only when `github.repository` is `gojhonny/orbo`.

## Evidence

- SPEC-034
- `package.json` name `orbo-voice` at version `1.1.1`
- `./cli/orbo check` and `npm pack --dry-run`

## Related records

- SPEC: SPEC-034
- Rules: 001, 002, 008, 011
- Supersedes: ADR-0024
