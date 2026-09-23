---
name: web-components
description: Use when adding or modifying the native orb-v element, attributes, properties, events, lifecycle, Shadow DOM, SSR behavior, registration, styling, or animation behavior.
---

# OrbV Web Component procedure

1. Specify the native public contract: attribute, property, method, event, and reflection behavior.
2. Normalize invalid values at the element boundary through pure core functions.
3. Keep class creation lazy and registration confined to the browser entry.
4. Make connect/disconnect idempotent and dispose listeners, animation, and speech.
5. Keep the shadow root closed and visual internals inaccessible to consumers.
6. Test construction, upgrade, reflection, reconnect, registration idempotence, and SSR import behavior.
7. Document native HTML plus relevant framework type integration without adding wrappers.

A new public member requires explicit compatibility review and SPEC evidence.
