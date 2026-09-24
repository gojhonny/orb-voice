---
description: Scopes accessibility, localization, reduced motion, host semantics, and closed-shadow behavior for the native orbo Web Component.
globs:
  - "src/element/**"
  - "src/factories/**"
  - "src/services/animation.service.ts"
  - "README.md"
---
# Rule 004: Web Component accessibility and localization

- Effective: 2026-08-21
- Priority: Critical
- Applies: `<orb-o>` behavior and documentation

1. The internal visual tree remains hidden from assistive technology because it conveys appearance, not content.
2. Consumers must be able to label the host when the orb has semantic meaning.
3. Respect `prefers-reduced-motion` by default and expose deterministic overrides.
4. Do not encode meaning only through color or motion in package documentation.
5. Do not place product copy, greetings, personas, or translations in the visual shadow tree.
6. Language configuration uses BCP 47 tags and must remain consumer-overridable.
7. Spoken applications must provide their own visible transcript or equivalent text alternative.
8. Test accessibility-relevant host behavior without changing the production closed-shadow boundary; focused factory tests may verify generated internal semantics.
