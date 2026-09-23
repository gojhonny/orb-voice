# ADR-0018: Keep npm identity independent from GitHub ownership

- Status: Superseded by ADR-0021
- Created: 2026-09-08
- Updated: 2026-09-19
- Mode: Prospective

OrbZ was later renamed to OrbV. This record is historical evidence of the
decision to keep `@neongate-ai/orbz` after SPEC-026. Current identity is ADR-0021.

## Context

After SPEC-026, the owner clarified that the existing npm package is retained.
The GitHub move does not require changing consumer dependency or import strings.

## Decision

Keep `@neongate-ai/orbz` and its entry points as the published package identity.
Use `gojhonny/orbz` for GitHub URLs, release workflow ownership and npm trusted
publisher repository configuration. Keep author/copyright `gojhonny`.

This partially supersedes ADR-0017: only its npm-scope migration is reversed.
The `gojhonny` runtime preset, Orb CLI cleanup behavior and renamed image stay
as implemented by SPEC-026. The `orb` binary and `<orb-z>` element are unchanged.

## Consequences

Existing npm consumers retain their dependency/import strings. Package tarballs,
registry operations, badges, installer commands and release checks use the
existing npm name while GitHub links use the current repository owner. Audits
must validate these two identities independently instead of banning every
reference to the published scope. Publication still requires separate approval.

## Evidence

- SPEC-027; package metadata, installer, release workflow and ownership audit.
