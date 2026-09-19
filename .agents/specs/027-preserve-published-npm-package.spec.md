# SPEC-027: Preserve the published npm package identity

- Status: Superseded by SPEC-030
- Created: 2026-09-08
- Updated: 2026-09-19
- Mode: Prospective
- Owner: Jonatas Sales

OrbZ was later renamed to OrbV. This record is historical evidence of preserving
`@neongate-ai/orbz`. Current identity is SPEC-030 / ADR-0021.

## Problem

SPEC-026 changed the npm identity along with the GitHub owner. The owner has
clarified that the published package must remain `@neongate-ai/orbz`, while the
repository remains `gojhonny/orbz`. The registry currently reports version 1.0.0
for the existing package; changing its name would create a separate package.

## Scope

Restore the existing npm name in metadata, imports, installer behavior, badges,
release automation and active documentation. Update the ownership audit and
record this clarification in the harness. Start from current remote `staging`
at `2dcc079b60201124d33320c275a14b8134b6c851`, and open a correction PR against
`staging`. Leave the version,
cleanup behavior, runtime preset, GitHub owner, author and assets unchanged.
No ZIP edits, merge, tag, token configuration or package publication.

## Requirements

1. `package.json#name` remains `@neongate-ai/orbz`; GitHub repository and issue
   URLs remain under `gojhonny/orbz`, with author/copyright `gojhonny`.
2. All active consumer examples and the real installer use the existing npm
   package and its entry points. The installer selects its own version, rejects
   unrelated package names and self-installation, and preserves consumer source.
3. Release identity checks, tarball filename, registry lookups and post-publish
   validation target `@neongate-ai/orbz`. The workflow's GitHub owner guard and
   repository URL remain `gojhonny/orbz`.
4. Replace the blanket previous-brand audit with precise package/repository
   invariants: permit the existing npm package, reject stale GitHub ownership,
   and reject the abandoned npm name in active implementation/guidance.
5. Current guidance distinguishes npm identity from GitHub ownership. Record the
   amendment to ADR-0017/SPEC-026 without rewriting their original decisions or
   evidence. Existing users keep npm dependency/import strings; explicit preset
   migration remains a separate compatibility consideration from SPEC-026.
6. Run focused installer/ownership/documentation audits and the full prepack
   quality gate. The unchanged cleanup and runtime contracts must still pass.

## Acceptance criteria

- [x] Package metadata, installer and consumer examples keep the published name.
- [x] Release automation uses the existing npm package and current GitHub owner.
- [x] Audits distinguish allowed npm references from obsolete GitHub ownership.
- [x] README and active harness explain the clarified ownership boundaries.
- [x] Full quality gate and npm payload inspection pass without a version bump.

## Evidence

- Read-only registry verification on 2026-09-08: `@neongate-ai/orbz` is published
  at 1.0.0. Its current registry metadata still contains the prior GitHub URL;
  the corrected repository metadata will take effect in a future publication.
- `npm pack --dry-run --json` passed with Node 24.19.0 and pnpm 10.32.1. Its
  `./cli/orb check` prepack gate passed lint, source/test type checks, all 47 tests
  in 19 suites, both builds, SemVer and all ten audits. The unchanged optional-
  chain lint warning remains in the configuration clone module.
- Ownership/installer fixtures verify the published name, same-version install,
  existing dependency preservation without reinstalling, unchanged consumer
  source, rejected abandoned/unrelated scopes, self-install guards and published
  cleanup rejection. CLI and documentation audits pass with the corrected name.
- The dry-run payload is `@neongate-ai/orbz@1.0.0`, filename
  `neongate-ai-orbz-1.0.0.tgz`, with 41 entries limited to `dist/`, `cli/` and
  standard root metadata. No source maps or harness files are included.
- `git diff --check` passed. Comparison against remote staging confirms no changes
  to runtime source, cleanup implementation, assets or license. No token or
  registry mutation was performed.

## Related records

- ADR-0018 partially supersedes ADR-0017's npm identity decision.
- SPEC-026; Rules 001, 006, 007, 008, 009, 011 and 012.

## Compatibility and risks

This restores dependency/import continuity for the existing npm package. It does
not make SPEC-026's separate preset rename/default cleanup behavior a compatible
patch change. Release numbering and publication remain a later owner decision.
The npm publisher must authorize the existing package and the current GitHub
repository; account names on the two services do not need to match.
