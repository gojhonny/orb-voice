# Architecture decision records

ADRs preserve durable OrbV decisions. Records `0001` through `0006` were
reconstructed retrospectively on **2026-08-21** from the package's intended
contracts. Records `0007` onward document current decisions from their stated
creation date. ADR-0010 establishes OrbV as the single repository command
surface; ADR-0011 adds the explicit public npx installer exception; ADR-0012 adds agent-native workflows, runtime guardrails, and harness maturity enforcement.

Use [`template.md`](./template.md) for new decisions. Never rewrite an accepted
ADR to hide a changed decision; record the update and supersede it explicitly.

[ADR-0013](0013-canonical-json-configuration.adr.md) establishes the single JSON source and derived typed configuration.

[ADR-0014](0014-voice-model-and-realtime-port.adr.md) separates voice selection, live audio lifecycle and application-owned session authorization.

[ADR-0015](0015-application-owned-credentials.adr.md) keeps permanent provider keys server-side and forbids secret-bearing element/JSON/session configuration.

[ADR-0016](0016-compact-configuration-and-internal-data.adr.md) partially supersedes
ADR-0013: compact JSON plus typed internal data defaults and compatible composition.

[ADR-0017](0017-gojhonny-package-identity.adr.md) records the owner-requested package,
repository and default-preset identity migration, including consumer compatibility
and the separate npm publication boundary.

[ADR-0018](0018-preserve-npm-package-identity.adr.md) is superseded by ADR-0021.
It is historical evidence of keeping `@neongate-ai/orbz` after SPEC-026.

[ADR-0019](0019-neongate-preset-identity.adr.md) supersedes the preset identity
decision in ADR-0017/0018: NeonGate remains `neongate`, with a deprecated alias
for the accidental identifier published in 1.0.1.

[ADR-0020](0020-direct-orb-source-launcher.adr.md) makes the managed source-checkout
launcher part of local pnpm setup so repository engineering uses `orbv <command>`
directly, while keeping application dependency installation and explicit npx
consumer setup separate. Public command spelling is `orbv` (ADR-0021).

[ADR-0021](0021-orbv-canonical-identity.adr.md) recorded OrbV, npm `orbv`,
`<orb-v>`, and the `orbv` CLI. ADR-0022 supersedes that distribution identity.

[ADR-0022](0022-orb-voice-distribution.adr.md) makes `orb-voice` the npm
package, public CLI, and `<orb-voice>` element. GitHub metadata targets
`gojhonny/orb-voice`.

[ADR-0023](0023-orbu-package-identity.adr.md) attempted npm `orbu` and
`<orb-u>`. npm rejected that package name. ADR-0024 reverts it.

[ADR-0024](0024-restore-orb-voice-identity.adr.md) restored Orb Voice,
`orb-voice`, and `<orb-voice>`. ADR-0025 supersedes that identity.

[ADR-0025](0025-orbo-product-identity.adr.md) makes Orbo the product, `orbo-voice`
the npm package, `<orb-o>` the element, and `orbo` the CLI. GitHub metadata
targets `gojhonny/orbo`.
