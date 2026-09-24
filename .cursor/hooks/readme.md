# Cursor runtime hooks

These hooks close the feedback loop without changing Orbu runtime code.

- `guard-shell.cjs` blocks destructive or publication commands and requests human approval for release-boundary Git operations.
- `feedback-edit.cjs` runs local Biome feedback for supported edited files when the repository dependency graph is installed.

Hooks read Cursor event JSON from stdin. The gate always returns a permission decision; malformed gate input returns `ask` rather than failing open.
