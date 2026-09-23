# ADR-0022: Distribute Orb Voice as orb-voice

- Status: Accepted
- Created: 2026-09-22
- Updated: 2026-09-22
- Mode: Prospective

## Context

ADR-0021 selected an unscoped npm package whose name npm rejected during the
first publication attempt as too similar to existing packages. The release
workflow had already created `v1.1.0` before that publish failed.

The owner then selected `orb-voice` for the npm package, the public command,
and the custom element, and asked for the previous distribution identifier to
leave current-state source.

## Decision

Orb Voice is the product name. The npm package, public CLI, import path, and
custom element tag are `orb-voice`. GitHub metadata targets
`gojhonny/orb-voice`. The owner renames that repository before the release
guard can publish.

Do not register the previous element tag. Do not keep the previous package name
or binary as an alias. Version `1.1.1` is the next release. Do not move or
delete `v1.1.0`.

Internal shell helpers remain `orb_*` with `ORB_*` environment variables.
The NeonGate preset remains `neongate`. The documentation homepage remains
`https://neongate.com.br/docs/orbz/overview`.

The release workflow publishes and verifies the package before it creates the
git tag or GitHub release. The first publication uses `NPM_TOKEN`.

## Consequences

Consumers install `orb-voice`, run `npx orb-voice --setup`, and render
`<orb-voice>`. Source-checkout engineering uses `orb-voice` and
`./cli/orb-voice`. Public types use `OrbVoice*` and `ORB_VOICE_*`.

Until the GitHub repository is renamed, the release workflow does not publish.

## Evidence

- SPEC-031
- `package.json` name `orb-voice` at version `1.1.1`
- `.github/workflows/release.yml`

## Related records

- SPEC: SPEC-031
- Rules: 001, 002, 008, 011
- Supersedes: the npm, element, and public CLI decision in ADR-0021
