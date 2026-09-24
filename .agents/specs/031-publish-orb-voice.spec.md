# SPEC-031: Publish Orb Voice as orb-voice

- Status: Implemented for source; distribution identity superseded by SPEC-032
- Created: 2026-09-22
- Updated: 2026-09-22
- Mode: Prospective
- Owner: Jonatas Sales

## Problem

npm rejected the unscoped package name selected by SPEC-030. The repository
already tagged `v1.1.0` for that failed publication. Current-state source must
not keep that rejected distribution identifier.

## Scope

Rename the current package, public CLI, custom element, events, CSS, dist
filenames, imports, and GitHub metadata to `orb-voice`, and set the version to
`1.1.1`. Publish through the GitHub release workflow after `NPM_TOKEN` is
configured. Do not publish from a local machine during preparation.

Historical SPECs and ADRs may still name the rejected identifier. Do not move
`v1.1.0`. Do not rename the NeonGate preset. Keep `orb_*` shell helpers.

## Requirements

1. `package.json` name is `orb-voice` and version is `1.1.1`. The only bin is
   `orb-voice` pointing at `./cli/orb-voice`.
2. The only custom element is `<orb-voice>`. Public types use `OrbVoice*` and
   `ORB_VOICE_*`. Events are `orb-voice-*`. CSS uses `--orb-voice-*` and
   `.orb-voice-*`.
3. Dist entries are `dist/orb-voice.js` and `dist/standalone/orb-voice.js`.
   Imports use `orb-voice` and `orb-voice/browser`.
4. GitHub metadata targets `gojhonny/orb-voice`. Current-state files do not
   contain the rejected distribution identifier.
5. The release workflow publishes and verifies `orb-voice --help` before it
   creates `v1.1.1` or the GitHub release titled `Orb Voice 1.1.1`.
6. `v1.1.0` stays where it is. This change does not run `npm publish`.

## Acceptance criteria

- [x] Package name, version, bin, dist filenames, and GitHub URLs match above.
- [x] `ORB_VOICE_TAG_NAME` is `orb-voice`.
- [x] `./cli/orb-voice check` passes.
- [x] `npm pack --dry-run` reports `orb-voice@1.1.1`.
- [x] A temp install of the tarball runs `npx orb-voice --help`.
- [x] No local publish, tag, or merge is performed by this change.

## Evidence

- `./cli/orb-voice check` passed.
- `npm pack --dry-run` reported `orb-voice@1.1.1` as `orb-voice-1.1.1.tgz`
  with `dist/`, `cli/`, `package.json`, `README.md`, and `LICENSE`.
- A temporary project installed that tarball and ran `npx orb-voice --help`
  and `./node_modules/.bin/orb-voice --help`.
- `npm view orb-voice` returned 404 before the first publication.

## Related records

- ADRs: ADR-0022 supersedes the distribution decision in ADR-0021
- Rules: 001, 008, 011

## Compatibility and risks

This replaces an unpublished package name and the element tag. `v1.1.0` remains
an immutable tag for a release that never reached npm. npm may still reject
`orb-voice` at publish time. The release guard does not run until the GitHub
repository name matches `gojhonny/orb-voice`.
