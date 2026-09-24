# ADR-0024: Restore Orb Voice as the canonical package identity

- Status: Accepted
- Created: 2026-09-24
- Updated: 2026-09-24
- Mode: Prospective

## Context

ADR-0023 and SPEC-032 renamed the live package from Orb Voice to Orbu, with npm name `orbu` and custom element `<orb-u>`. That change merged as pull request #28. npm then rejected the unscoped name `orbu` under its package-name similarity policy.

`orb-voice` is published and is the package identity to keep. The GitHub repository is being renamed back to `gojhonny/orb-voice` separately from this source change.

## Decision

Orb Voice is the canonical current identity:

- Brand: Orb Voice
- npm: `orb-voice`
- GitHub metadata: `gojhonny/orb-voice`
- Custom element: `<orb-voice>` only
- Public CLI: `orb-voice`, with consumer setup `npx orb-voice --setup`
- Events: `orb-voice-*`
- Public types: `OrbVoice*` and `ORB_VOICE_*`, including `defineOrbVoice`
- Version: remain `1.1.1`

Do not register `<orb-u>` or `<orbu>`. Do not keep an `orbu` binary, import path, or event alias. Internal POSIX helpers remain `orb_*` with `ORB_*` environment variables. The NeonGate preset remains `neongate`. The homepage remains `https://neongate.com.br/docs/orbz/overview`.

This restores the npm, element, and public CLI decision in ADR-0022. It supersedes ADR-0023. Publication, deprecation, tags, and GitHub releases are not part of this restoration. npm reports `orb-voice@1.0.0`; this repository stays at source version `1.1.1` and does not publish from this change.

## Consequences

Active source, package metadata, the CLI, audits, and consumer documentation match the pre-Orbu Orb Voice contract. ADR-0023 and SPEC-032 remain as historical evidence of the rejected rename. The merge that introduced Orbu stays in history and is reverted rather than erased.

## Evidence

- SPEC-033
- Revert of merge `9e7f4db00173a3baa145a523b4ab7aec5d824466`
- `package.json` name `orb-voice` at version `1.1.1`

## Related records

- SPEC: SPEC-033
- Rules: 001, 002, 008, 011
- Supersedes: ADR-0023
- Restores: ADR-0022
