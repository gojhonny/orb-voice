# ADR-0019: Keep NeonGate preset branding independent from GitHub ownership

- Status: Accepted; npm/GitHub identity superseded by ADR-0021
- Created: 2026-09-08
- Updated: 2026-09-19
- Mode: Prospective

OrbZ was later renamed to OrbV. Package identity is unscoped `orbv` and GitHub
`gojhonny/orbv` (ADR-0021). This record remains the NeonGate preset decision;
do not rename the `neongate` preset.

## Context

The owner clarified that NeonGate is the palette's brand. The GitHub move to
`gojhonny/orbz` did not authorize renaming that preset. Version 1.0.1 has already
published the accidental identifier and its typed palette exports.

## Decision

Restore `neongate` as the canonical default and first of six preset names.
Preserve all five palette colors. Continue to use `@neongate-ai/orbz` for npm
and `gojhonny/orbz` for GitHub.

Accept `gojhonny` as a deprecated input alias and normalize public attributes
and properties to `neongate`. Preserve direct palette access through a frozen,
non-enumerable alias in the runtime tree; derived compatibility exports retain
that same reference. Canonical enumeration, JSON, examples and installer output
use `neongate`. The transformer normalizes legacy source input on its owned clone.

This supersedes the preset rename in ADR-0017 and ADR-0018's decision to retain
it. Their npm and repository boundaries otherwise remain as clarified by ADR-0018.

## Consequences

Consumers of the established NeonGate identifier work again. Consumers of the
accidentally published identifier keep their palette colors and type support;
the alias is not a new selectable preset. Tests cover normalization, palette
identity, enumeration, legacy input, immutability and public element reflection.
Release metadata stays at main's 1.0.1 until a separate release decision.

## Evidence

- SPEC-028; preset and configuration suites; ownership and documentation audits.
