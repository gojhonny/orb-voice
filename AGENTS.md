# OrbV engineering instructions

This repository owns only the `orbv` npm package.

## Required reading order

1. `.agents/context/readme.md`
2. `.agents/rules/001-package-contract.rule.md`
3. `.agents/rules/002-source-organization.rule.md`
4. `.agents/rules/003-code-style.rule.md`
5. `.agents/rules/004-web-component-accessibility-and-localization.rule.md`
6. `.agents/rules/005-voice-and-speech.rule.md`
7. `.agents/rules/006-testing.rule.md`
8. `.agents/rules/007-harness-documentation-and-audits.rule.md`
9. `.agents/rules/008-engineering-cli.rule.md`
10. `.agents/rules/009-git-commits-and-semantic-versioning.rule.md`
11. `.agents/rules/010-colocated-tests.rule.md`
12. `.agents/rules/011-public-orb-installer.rule.md`
13. `.agents/rules/012-agent-runtime-guardrails.rule.md`
14. The relevant SPEC and linked ADRs.

## Repository boundaries

- Keep `<orb-v>` as the single runtime UI implementation.
- Keep the package framework-agnostic and SSR-safe.
- Do not add documentation-site code or framework example applications here.
- Do not add runtime framework wrappers.
- Keep provider secrets and product conversation copy outside the package.
- Treat public API additions as compatibility commitments.
- Run `orbv check` before completing a release-oriented change.

## Harness, CLI, and Git gates

- A local root `pnpm install` provisions the managed user-scoped OrbV launcher; after source setup, use `orbv <command>` directly.
- `./cli/orbv setup --launcher` is a recovery path when the launcher was disabled, moved, or needs refreshing.
- Do not require package-manager executable runners for repository OrbV commands.
- `.agents/` contains context, ADRs, rules, specs, prompts, skills, and explicit workflows.
- `.audits/` contains deterministic repository checks.
- `orbv help` lists the shell-only local engineering commands.
- Husky hooks are thin adapters; OrbV owns pre-commit and commit-message behavior.
- `.cursor/hooks.json` enforces agent shell guardrails and fast post-edit feedback; release/publication boundaries remain human-controlled.
- `.agents/workflows/` contains explicit reusable task sequences; use them instead of inventing ad hoc release or regression procedures.
- Commit messages follow Conventional Commits and package versions follow SemVer.
- Executable Vitest suites are colocated with source under `src/`.
- Start behavioral changes with a SPEC and link an ADR when architecture changes.
- Keep a `readme.md` in every directory under `.agents/` and `.audits/`.

## Task routing

- Regression: use `.agents/workflows/regression-fix.md` plus the relevant domain skill.
- Review: use `.agents/workflows/review.md`; the optional Cursor `orbv-reviewer` subagent is review-only.
- Release: use `.agents/workflows/release.md`; agents must stop for human approval at tag/push/publish boundaries.
- Harness improvement: use `.agents/workflows/harness-improvement.md` and Rule 012.

## Engineering harness command

Run `orbv harness` explicitly when the repository harness needs scoring or reconciliation. Harness tooling is engineering-only and must never run automatically from install, build, test, or CI lifecycle hooks.
