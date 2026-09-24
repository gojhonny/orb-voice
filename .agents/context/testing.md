# Testing context

Vitest is the fast contract runner and happy-dom is the default deterministic
DOM environment. SSR entry tests opt into the Node environment. Executable
`*.test.ts` suites are colocated beside the source they verify under `src/`;
only shared setup and fixtures remain under `test/`.

Suite names start with the canonical concern prefix followed by a responsibility:
`core/`, `element/`, `factory/`, `port/`, `service/`, or `talk/`. Tests import
Vitest APIs explicitly and exercise public behavior. Element tests do not pierce
a live `<orb-o>` closed shadow root; focused factory tests may inspect a tree
they construct directly.

Browser emulation is not proof of complete browser interoperability. Changes to
Web Speech, focus, rendering, animation timing, custom-element upgrade behavior,
or accessibility-tree semantics also require a real-browser check.

Required confidence layers are:

1. lint-staged checks for files entering a commit;
2. Biome linting for the complete checkout;
3. strict TypeScript checks for source and tests;
4. colocated Vitest unit and component-contract suites;
5. package builds for module and standalone entries;
6. SemVer validation and versioned shell audits;
7. `npm pack --dry-run` in CI for payload inspection.

CLI regressions use dependency-free POSIX shell audits with disposable checkout
fixtures. Cleanup checks exercise actual filesystem outcomes, tracked/protected
paths, symlinks, preview/option semantics and failures without cleaning the working
checkout. Ownership checks exercise the installer with a local package-manager
fixture; no registry installation is needed for these deterministic checks.
