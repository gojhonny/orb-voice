---
description: Scopes the shell-only Orbo engineering CLI, direct launcher command surface, network boundaries, cleanup safety, setup behavior, and CI diagnostics.
globs:
  - "cli/**"
  - "package.json"
  - ".husky/**"
  - ".github/workflows/**"
---
# Rule 008: Engineering CLI

- Effective: 2026-09-04
- Updated: 2026-09-19
- Priority: High
- Applies: `cli/**` and CLI package integration

1. The repository CLI's public name is `orbo` and every implementation file is POSIX shell. Internal helpers may remain `orb_*` with `ORB_*` environment variables.
2. Do not add a Node, MJS, TypeScript, or framework-based command runner.
3. Repository commands include `bootstrap`, `setup`, `doctor`, `cleanup`, `lint`, `typecheck`, `test`, `build`, `harness`, `audit`, `check`, and the Git quality subcommands.
4. `orbo` is the canonical repository command surface. After source setup, human and agent engineering instructions use `orbo <command>` directly; do not require `pnpm exec orbo`, `npm exec -- orbo`, or equivalent local-bin runners.
5. A local root `pnpm install` may provision the managed user-scoped launcher through `pnpm:devPreinstall`. That hook must call the checked-in POSIX shell Orbo entry point, be safe before dependencies exist, skip launcher installation in CI bootstrap mode, and remain distinct from package-consumer lifecycle scripts.
6. The `setup` package script is a recovery bridge for refreshing the launcher; `prepack` is the release safety lifecycle. Do not duplicate Orbo engineering commands as package-script aliases.
7. `bootstrap` may install declared development dependencies. Explicit consumer project setup may install the Orbo runtime dependency. The explicit `harness` command may invoke its external harness utility. No other command performs network installation.
8. Repository launcher setup must not edit shell profiles or replace unmanaged paths. It may use `ORB_BIN_DIR`, `PNPM_HOME`, `XDG_BIN_HOME`, or the user-local bin directory and must report when the destination is not on `PATH`.
9. Consumer setup must not generate or overwrite application source files.
10. `cleanup` removes untracked generated state and root/nested dependencies by default. `--keep-dependencies` preserves dependencies; `--dependencies` remains a compatibility option; `--dry-run` previews without deletion. Protect tracked paths, `.git/`, `.agents/`, `.audits/`, source, assets and nested repositories, including when they sit inside a generated-looking target. Dependency-owned source/assets inside `node_modules` are generated state. Never follow directory symlinks or delete their destinations. Validate all options before mutation and propagate filesystem/Git errors (SPEC-026).
11. `doctor` exits nonzero when required repository conditions fail and supports CI mode.
12. Repository-only commands reject execution from the published package.
13. Remove commands, terminology, and infrastructure assumptions that do not belong to the Orbo library.
