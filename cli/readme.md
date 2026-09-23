# Orb Voice engineering CLI

Orb Voice is the POSIX shell command surface for `orb-voice`. It has two
strictly separated execution contexts:

1. **Repository mode** operates on an Orb Voice source checkout.
2. **Consumer setup mode** is the published npm binary used by
   `npx orb-voice --setup`.

There is no Node, MJS, TypeScript, or framework-based command runner. Small
inline Node programs are used only where reliable JSON parsing is required.

## Source checkout: use `orb-voice` directly

After cloning Orb Voice, install the dependency graph normally:

```bash
pnpm install
```

The root-only `pnpm:devPreinstall` hook provisions the managed user-scoped
launcher before dependencies are installed. From that point forward, the
canonical engineering interface is always the direct command:

```bash
orb-voice help
orb-voice doctor
orb-voice lint
orb-voice typecheck
orb-voice test
orb-voice build
orb-voice audit
orb-voice check
```

Do not wrap repository Orb Voice commands in a package-manager executable runner.
The launcher points at the source checkout that most recently configured it and
works from any current working directory.

If launcher provisioning was disabled or its destination is not on `PATH`, use
the checked-in entry point only as a recovery path:

```bash
./cli/orb-voice setup --launcher
```

The launcher destination is selected from `--bin-dir`, `ORB_BIN_DIR`,
`PNPM_HOME`, `XDG_BIN_HOME`, then `$HOME/.local/bin`. Orb Voice reports when the
selected directory is not on `PATH`; it never edits shell profiles. Existing
Orb Voice-managed launchers can be refreshed, while unmanaged files, symlinks, and
non-regular paths are never replaced.

The source-install lifecycle is intentionally `pnpm:devPreinstall`, which pnpm
runs only for the root project during a local install. Orb Voice does not use
`preinstall`, `install`, `postinstall`, or `prepare` to provision repository
state for package consumers.

## Command behavior

With no arguments, repository Orb Voice shows help. Find command details with
`orb-voice help setup`, `orb-voice help git lint`, or `orb-voice git lint --help`. `orb-voice git` and
`orb-voice git help` show the Git command catalog. Help stays local and does not
execute the selected command.

`--logs` is repeatable before or immediately after a command and at each Git
command level, for example `orb-voice --logs doctor`, `orb-voice doctor --logs`, or
`orb-voice git doctor --logs --ci`. Diagnostics go to stderr. Arguments following
command options are left for that command or its delegated utility; put Orb Voice's
diagnostic flag before those options.

Unknown commands, invalid options, missing option values, and incompatible Git
lint modes return status 2. Missing required executables return 127. Delegated
utilities retain their own exit status. ANSI output is disabled by `NO_COLOR` or
noninteractive stdout.

## Repository commands

| Command | Purpose |
| --- | --- |
| `orb-voice bootstrap` | Install development dependencies, configure hooks and the launcher, then run doctor. |
| `orb-voice setup --launcher` | Refresh the user-scoped launcher without editing shell profiles. |
| `orb-voice doctor` | Validate Node, pnpm, dependencies, configs, audits, hooks, and local setup. |
| `orb-voice cleanup` | Remove untracked generated output and root/nested dependencies; use `--keep-dependencies` for output only or `--dry-run` to preview. |
| `orb-voice lint` | Run Biome across the checkout. |
| `orb-voice typecheck` | Type-check source and colocated tests. |
| `orb-voice test` | Run Vitest once; supports `--watch` and `--coverage`. |
| `orb-voice build` | Build the module and standalone distributions. |
| `orb-voice harness` | Run the external harness-score utility explicitly. |
| `orb-voice audit` | Run all `.audits/*.audit.sh` files through `/bin/sh`. |
| `orb-voice check` | Run the complete release quality gate. |
| `orb-voice git setup` | Write thin Husky adapters and activate the hooks path. |
| `orb-voice git doctor` | Validate Commitlint, lint-staged, Husky, SemVer, and hook wiring. |
| `orb-voice git pre-commit` | Validate staged version changes, then run lint-staged. |
| `orb-voice git commit-message` | Validate one commit message using Commitlint. |
| `orb-voice git lint` | Validate the latest commit or a revision range. |
| `orb-voice git version-check` | Require canonical, forward-only SemVer changes. |

`orb-voice install` is a repository-only alias for `orb-voice bootstrap`. `orb-voice clean` aliases
`orb-voice cleanup`, and `orb-voice neon` aliases `orb-voice harness`. `orb-voice version`,
`orb-voice --version`, and `orb-voice -V` print the executing package version.

`orb-voice git commit message <file>` and `orb-voice git commit-msg <file>` are aliases for
`orb-voice git commit-message <file>`. `orb-voice git commits` retains the commit-history
validation interface (`--last` or `--from` plus `--to`).

### Cleanup

```bash
orb-voice cleanup --dry-run            # preview the default cleanup
orb-voice cleanup                      # remove output and dependencies recursively
orb-voice cleanup --keep-dependencies  # clear output while retaining dependencies
orb-voice bootstrap                    # restore the dependency graph afterwards
```

Cleanup targets `node_modules`, `dist`, `coverage`, `.vitest`, `.cache`, `build`,
`out`, `*.tsbuildinfo`, and `*.tgz` throughout the checkout. `--dependencies`
remains a compatibility option for the default behavior; combining it with
`--keep-dependencies` is an error. Dry runs print the same eligible removal
targets without changing files.

Git metadata, nested repositories, `.agents`, `.audits`, source, and assets are
protected. A target containing tracked files or protected state is retained in
full and reported. Dependency-owned `src` and `assets` directories are generated
state and are removed with their `node_modules` parent. Output-only cleanup
preserves dependencies even when they occur inside an output directory, while
removing eligible generated siblings.

Cleanup requires a readable Git checkout and ordinary shell utilities; Node.js,
pnpm, and installed dependencies are unnecessary. It never follows directory
symlinks: an untracked generated symlink can be removed, but its destination
remains untouched. Invalid options are rejected before mutations, and Git,
discovery, or removal failures stop cleanup with a nonzero status.

## Consumer project setup

The published package exposes one binary:

```json
{
  "bin": {
    "orb-voice": "./cli/orb-voice"
  }
}
```

For one-shot consumer setup, use the explicit package-and-binary form so
execution never depends on npm inferring the binary name:

```bash
npx -y --package=orb-voice@latest orb-voice
```

With no arguments, the published binary runs project setup. It requires an
existing `package.json`, detects npm, pnpm, yarn, or bun, installs the executing
Orb Voice version into `dependencies`, and prints the registration snippet. It does
not create or overwrite application source files.

Useful variants:

```bash
npx -y --package=orb-voice@latest orb-voice --package-manager pnpm
npx -y --package=orb-voice@latest orb-voice --project ./apps/web
npx -y --package=orb-voice@latest orb-voice --dry-run
```

This npx flow is separate from the source-checkout engineering launcher. Adding
Orb Voice as an application dependency does not install a repository launcher or run
repository setup.

## Package scripts

Repository commands are not duplicated as package-script aliases.

- `pnpm:devPreinstall` provisions the managed launcher only for a local root
  pnpm install of the Orb Voice source checkout.
- `setup` is a recovery bridge for manually refreshing that launcher.
- `prepack` delegates to `./cli/orb-voice check` so packing and publishing cannot bypass
  the complete quality gate.

The engineering UX remains `orb-voice <command>`.

## Safety

Orb Voice does not edit shell profiles, overwrite unmanaged launchers, generate
consumer source files, or publish packages. Network installation is limited to
explicit repository bootstrap, explicit project setup, and the explicit external
harness command. Cleanup is limited to generated repository state. Provider
credentials and product conversation copy remain outside the CLI and package
runtime.
