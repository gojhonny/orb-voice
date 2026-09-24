# Git hooks

These files are deliberately thin POSIX shell adapters. Husky owns hook
activation, while Orb Voice owns repository behavior.

- `pre-commit` delegates to `orb-voice git pre-commit`, which checks staged package
  version changes and runs lint-staged.
- `commit-msg` delegates to `orb-voice git commit-message`, which runs Commitlint
  with the Conventional Commits configuration.

Run `./cli/orb-voice git setup` after dependency installation. Husky's generated
`.husky/_/` directory is local installation state and is not committed.
