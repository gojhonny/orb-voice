---
description: Scopes TypeScript, JavaScript, configuration, formatting, import-order, typing, and secret-handling conventions for OrbV engineering changes.
globs:
  - "src/**"
  - "test/**"
  - "cli/**"
  - "*.ts"
  - "*.js"
  - "*.cjs"
  - "*.json"
---
# Rule 003: TypeScript and code style

- Effective: 2026-08-21
- Priority: High
- Applies: Source, tests, CLI configuration

1. Use TypeScript strict mode and explicit public types.
2. Use single quotes in TypeScript and JavaScript.
3. Prefer interfaces for object contracts.
4. Use `./` imports only for sibling modules; use configured aliases for non-sibling source imports.
5. Group imports as platform/third-party, absolute aliases, then relative imports.
6. Keep modules small and named by responsibility.
7. Do not leak implementation-only types.
8. Do not embed credentials, API keys, or product-specific secrets.
9. Biome is the formatting and linting authority for supported files.
