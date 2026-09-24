---
description: Defines the immutable package, publishing, framework-agnostic, SSR-safe, and public compatibility boundaries for Orb Voice.
alwaysApply: true
---
# Rule 001: Package contract

- Effective: 2026-08-21
- Updated: 2026-09-24
- Priority: Critical
- Applies: Always

1. `orb-voice` is a library, not an application or monorepo.
2. Keep the package framework-agnostic and SSR-safe.
3. Keep `<orb-voice>` as the only runtime UI implementation.
4. `orb-voice/browser` owns registration side effects.
5. `react-types` is type-only and must not add a React runtime dependency.
6. Provider secrets belong to consuming applications.
7. Intentional npm payload is limited to `dist/`, the shell-only `cli/`, and npm root metadata.
8. Do not publish source maps.
9. Treat every public export, attribute, property, method, event, and entry point as a compatibility commitment.
10. Documentation sites and framework examples live outside this repository.
11. npm identity and GitHub ownership are independent: publish `orb-voice`
    from `gojhonny/orb-voice`. Current product identity is Orb Voice (ADR-0022,
    restored by ADR-0024 and SPEC-033). Do not keep `@neongate-ai/orbz`, `<orb-z>`,
    the `orb` binary, `orbu`, or `<orb-u>` as current aliases.
12. Preset branding is independent of npm and GitHub ownership. Keep NeonGate's
    canonical identifier `neongate`, its established colors and six-name preset
    list. Preserve the deprecated 1.0.1 alias only at compatibility boundaries
    (ADR-0019 and SPEC-028); do not promote account handles into preset branding.
