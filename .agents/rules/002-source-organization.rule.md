---
description: Scopes source organization, concern folders, naming, suffixes, and colocated-test placement for the Orbu TypeScript package.
globs:
  - "src/**"
  - "tsconfig*.json"
  - "tsdown*.ts"
---
# Rule 002: Source organization

- Effective: 2026-08-21
- Updated: 2026-09-19
- Priority: Critical
- Applies: `src/**`

1. Keep `factories/`, `ports/`, and `services/` directly under `src/`.
2. Use `core/appearance/`, `core/motion/`, and `core/lib/` for their named concerns.
3. Use `talk/` for speech, adapters, flow data, and talk types; never create `voice/`.
4. A source folder must contain at least two related source files or be flattened.
5. No file or directory below `src/` may begin with `orbu` or `orbu-`, except the owner-selected canonical configuration file `src/orbu.config.json` (ADR-0013, identity updated by ADR-0023).
6. Production modules use `.port.ts`, `.adapter.ts`, `.types.ts`, `.service.ts`, `.factory.ts`, `.compute.ts`, `.guard.ts`, `.data.ts`, and `.client.ts` according to responsibility.
7. Colocated tests append `.test.ts` to the tested source base name under Rule 010.
8. Public entry points may use `index.ts` and `index.css`.
9. `src/orbu.config.json` owns editable component, palette and realtime settings. ADR-0016 assigns internal appearance, motion and speech defaults to uppercase constants in explicit concern-owned `.data.ts` modules. The transformer composes and validates one frozen runtime tree; compatibility exports derive from it. Bundle JSON and TypeScript data without filesystem access or fetch. Type contracts, validation grammar and executable behavior remain TypeScript responsibilities.
10. Never add framework-specific runtime components.
