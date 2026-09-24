# Release workflow

Use when preparing a patch, minor, or major Orb Voice release. Publishing remains a human-controlled action.

1. Read `.agents/context/release.md`, Rule 009, Rule 011, and the release SPEC.
2. Confirm the working branch is intended for release and the working tree is clean.
3. Confirm `package.json#version` is the intended canonical SemVer.
4. Run `orb-voice doctor`.
5. Run `orb-voice lint`.
6. Run `orb-voice typecheck`.
7. Run `orb-voice test` and require zero unhandled errors.
8. Run `orb-voice check`.
9. Run `npm pack --dry-run` and inspect the payload.
10. Confirm local `main` equals `origin/main` before tagging a merged release.
11. Confirm the target npm version is not already published.
12. Stop for human approval before `git tag`, `git push`, or any publish command.
13. After a human publishes, verify the registry version and `npx` binary.

The runtime shell guard denies autonomous package publication and asks for approval on release-boundary Git operations.

## Owner-authorized CI release

SPEC-024 records explicit owner authorization for the first major release.
`.github/workflows/release.yml` runs on main package metadata changes or manual
dispatch from main. It performs the full prepack gate, rejects stale main heads
and conflicting tags, and publishes the validated tarball. Matching published
artifacts can be verified on retry; existing tags and npm versions are immutable.

The first publication of `orb-voice` uses the `NPM_TOKEN` repository secret.
Trusted publishing can be configured only after that package exists on npm.
Credentials are never committed or printed.

ADR-0024/SPEC-033 restore `orb-voice` as the npm package, public CLI, and
`<orb-voice>` element after npm rejected `orbu`. GitHub metadata targets
`gojhonny/orb-voice`. ADR-0022/SPEC-031 record that distribution identity.
ADR-0021/SPEC-030 record the earlier unscoped package name that npm rejected.
The release guard runs when `github.repository` is `gojhonny/orb-voice`.

The workflow publishes and verifies registry integrity and `orb-voice --help`
before it creates the git tag or GitHub release. If npm rejects the package
name, no tag is created. If tagging fails after a successful publish, rerun the
workflow; the registry check accepts the same tarball integrity and does not
overwrite it. Do not move an existing tag or bump a version to hide failure.
