# Specification workflow

1. Confirm the problem through current source, tests, or a reproducible failure.
2. Create or update one bounded SPEC before implementation.
3. Link architectural decisions and mandatory rules.
4. Define public behavior and negative cases, including SSR, accessibility, localization, and speech where relevant.
5. Implement the smallest coherent change.
6. Add tests and audits as evidence rather than relying on prose alone.
7. Run `orbv check` and inspect the package payload.
8. Mark the SPEC `Implemented` only when every acceptance criterion has evidence.

A local source `pnpm install` provisions the managed OrbV launcher. Use
`./cli/orbv setup --launcher` only as the recovery path when the launcher is not
available.

Retrospective records must say so explicitly. They document recovered intent and
must not pretend to be original source-control artifacts.
