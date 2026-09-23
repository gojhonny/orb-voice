# ADR-0021: OrbV is the canonical product identity

- Status: Accepted; npm, element, and CLI identity superseded by ADR-0022
- Created: 2026-09-19
- Updated: 2026-09-22
- Mode: Prospective

## Context

ADR-0018 kept npm identity `@neongate-ai/orbz` independent from GitHub ownership
`gojhonny/orbz`, with public binary `orb` and custom element `<orb-z>`. The owner
has now selected a single current product identity: OrbV, unscoped npm package
`orbv`, GitHub `gojhonny/orbv`, element `<orb-v>`, and public CLI `orbv`.

Keeping the previous names as aliases would leave a mixed identity in current
source. The old npm package remains published until a later deprecation.

## Decision

OrbV is the canonical current identity of this library:

- Brand: OrbV
- npm: `orbv`
- GitHub metadata: `gojhonny/orbv`
- Custom element: `<orb-v>` only
- Public CLI: `orbv`, with consumer setup `npx orbv --setup`
- Consumer docs homepage: `https://neongate.com.br/docs/orbz/overview`

Do not register `<orb-z>`, do not keep an `orb` binary, and do not dual-dispatch
`orbz-*` events. Internal POSIX helpers may remain `orb_*` with `ORB_*`
environment variables. NeonGate preset branding stays `neongate` (ADR-0019).

npm identity and GitHub ownership remain independent of preset branding. This
repository still does not ship an application, docs site, or `/api/orbv` routes.

This supersedes ADR-0018. It supersedes the published binary name and npx form
in ADR-0011, and the public command spelling `orb` in ADR-0010 and ADR-0020.
Those records remain historical evidence.

## Consequences

Current-state source, audits, release checks, and consumer documentation must
agree on OrbV. Historical SPECs and ADRs keep OrbZ when they describe past
decisions. Publication, GitHub repository rename, and deprecation of
`@neongate-ai/orbz` remain separate owner-approved operations.

## Evidence

- SPEC-030; package metadata, element registration, installer, audits, release
  workflow, and README.

## Related records

- SPEC: 030
- Rules: 001, 002, 008, 011
- Supersedes: ADR-0018; public CLI identity in ADR-0010, ADR-0011, and ADR-0020
