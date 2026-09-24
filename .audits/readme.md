# Orbo audits

These executable checks protect repository invariants broader than one unit
test. They are deterministic, network-free POSIX shell scripts.

After source setup, run all audits with:

```bash
orbo audit
```

The complete quality gate also runs them through `orbo check`.

- `architecture.audit.sh`: source boundaries, concern folders, and speech defaults.
- `configuration.audit.sh`: canonical JSON bindings, migrated data modules, and runtime exemptions recorded in [`configuration.inventory.md`](./configuration.inventory.md).
- `cli.audit.sh`: shell-only Orbo command surface, direct managed-launcher invocation, lifecycle separation, and removal of imported application assumptions.
- `cleanup.audit.sh`: isolated filesystem fixtures for default/nested dependency cleanup, protected and tracked paths, symlinks, dry runs, option validation and failure propagation.
- `documentation.audit.sh`: product-first README assets, consumer Web Component API coverage, repository-maintainer exclusion, and direct Orbo CLI guidance.
- `harness.audit.sh`: record structure, frontmatter, dates, navigation, and terminology.
- `guardrails.audit.sh`: Cursor hook configuration, shell gate decisions, edit-hook containment, workflows, and reviewer metadata.
- `package.audit.sh`: payload, scripts, source-only launcher lifecycle, dependencies, hooks, Commitlint, and SemVer policy.
- `ownership.audit.sh`: independent npm package, GitHub owner and NeonGate preset identities, canonical colors and enumeration, installer behavior and rejection of stale active references.
- `tests.audit.sh`: colocated suite layout, naming, Vitest configuration, and CI integration.

When an invariant changes intentionally, update its SPEC, linked ADR/rule,
implementation, documentation, and audit in the same change.
