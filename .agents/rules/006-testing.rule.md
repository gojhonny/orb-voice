---
description: Scopes Vitest, Happy DOM, SSR, browser-dependent checks, deterministic fakes, regression evidence, and the complete Orb Voice quality gate.
globs:
  - "src/**/*.test.ts"
  - "test/**"
  - "vitest.config.ts"
  - "tsconfig.test.json"
  - ".github/workflows/**"
---
# Rule 006: Testing

- Effective: 2026-08-21
- Updated: 2026-09-04
- Priority: High
- Applies: Behavioral changes

1. Use Vitest for unit and custom-element contract tests.
2. Use happy-dom for the default DOM suite and Node for SSR import tests.
3. Test public attributes, properties, methods, and events without piercing a live `<orb-voice>` closed shadow root; focused factory tests may verify generated internals.
4. Use deterministic fakes for voice, speech synthesis, fetch, media queries, and animation.
5. Every regression fix requires a failing test or executable audit that proves the prior failure.
6. Keep aliases in Vitest synchronized with TypeScript and build configuration.
7. Add a real-browser check when behavior materially depends on an actual browser implementation.
8. Executable suites are colocated under `src/` and follow Rule 010.
9. `./cli/orb-voice check` must include lint, source/test type checks, tests, builds, SemVer validation, and audits.
