# SPEC-030: OrbZ to OrbV product identity migration

- Status: Implemented; distribution identity superseded by SPEC-031
- Created: 2026-09-19
- Updated: 2026-09-22
- Mode: Prospective
- Owner: Jonatas Sales

## Problem

The published product still presents as OrbZ (`@neongate-ai/orbz`, `<orb-z>`,
`orb`, `gojhonny/orbz`) while the owner has selected OrbV as the canonical
identity. A first-time developer must not encounter a mixture of old and new
names in current-state source, package metadata, CLI UX, audits, or consumer
documentation.

## Scope

Rename the current product identity across the repository: brand, npm package,
custom element, public CLI, GitHub metadata, source identifiers, events, CSS
tokens, dist filenames, installer snippets, audits, CI/release checks, and
consumer README. Preserve architecture, runtime behavior, NeonGate preset
branding, and internal `orb_*` / `ORB_*` CLI machinery.

Do not publish npm, create tags, rename the GitHub repository remotely, or
deprecate `@neongate-ai/orbz`. Do not invent `/api/orbv` routes. This library
has no OrbZ application routes; application-owned examples remain
`/api/voice/speech` and `/api/voice/session`.

Historical SPECs and ADRs keep OrbZ when they record past decisions. Current-
state conclusions, rules, context, skills, audits, and the README use OrbV.

## Requirements

1. `package.json#name` is `orbv`. Repository and bugs URLs use `gojhonny/orbv`.
   Homepage and the README Documentation link are
   `https://neongate.com.br/docs/orbz/overview`. Version remains the current
   stable SemVer on `main`.
2. The only runtime custom element is `<orb-v>`. Do not register `orb-z` as an
   alias. Public types use `OrbV*` / `ORBV_*`; slug identifiers use `orbv`.
3. The published binary is `orbv`. Consumer setup is `npx orbv --setup` and the
   existing `setup` subcommand. Engineering commands after source setup are
   `orbv <command>` / `./cli/orbv <command>`. Internal `orb_*` helpers and
   `ORB_*` environment variables stay.
4. Consumer imports use `orbv` and `orbv/browser`. Dist entry files are
   `dist/orbv.js` and `dist/standalone/orbv.js`. Events are `orbv-*`. CSS
   tokens are `--orbv-*` / `.orbv-*`.
5. Audits, tests, and release automation encode the OrbV contract. They must
   not be weakened. `@neongate-ai/orbz` is not deprecated in this change.
6. SPEC-027 / ADR-0018 are superseded, not rewritten.

## Acceptance criteria

- [x] Package name, GitHub metadata, homepage, bin, and dist filenames use OrbV.
- [x] `ORBV_TAG_NAME` is `orb-v`; React intrinsics, queries, and docs match.
- [x] Public CLI is `orbv`; `npx orbv --setup` routes to project setup.
- [x] Installer installs `orbv` and prints `import 'orbv/browser'` plus `<orb-v>`.
- [x] README, rules, context, skills, and audits describe OrbV as current.
- [x] Historical SPECs/ADRs retain OrbZ as history and are marked superseded
      where they mandated the old npm/element/CLI identity.
- [x] `./cli/orbv check` and `npm pack --dry-run` pass with package identity
      `orbv`. No publish, tag, or remote repository rename.

## Evidence

- `./cli/orbv check` on 2026-09-19: lint (existing optional-chain warning in the
  configuration clone module), source/test typecheck, 52 tests in 19 suites,
  both builds, SemVer 1.0.3, and all audits.
- Ownership, package, CLI, and documentation audits assert `orbv`, `<orb-v>`,
  `npx orbv --setup`, GitHub `gojhonny/orbv`, and tarball `orbv-*.tgz`.
- Dist entries are `dist/orbv.js` and `dist/standalone/orbv.js`.

## Related records

- ADR-0021 supersedes ADR-0018 and the public identity portions of ADR-0011.
- SPEC-027 is superseded by this specification.
- Rules 001, 002, 008, 011.

## Compatibility and risks

This is a breaking public rename for consumers of `@neongate-ai/orbz`, `<orb-z>`,
`defineOrbz`, `orbz-*` events, and the `orb` binary. The new package name `orbv`
is a separate npm identity; the old package is left published until a later
owner-approved deprecation. GitHub metadata targets `gojhonny/orbv` before the
remote rename exists; release remains inert until that repository name is in
use. The owner-specified documentation URL still contains `/orbz/` because the
external docs path was not moved in this change.
