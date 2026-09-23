---
name: tdd
description: Use when implementing or changing a declared Orb Voice behavior and you need a strict red-to-green loop at a stable public seam with regression evidence.
---

# Test-Driven Development

TDD is one observable behavior at a time: red, minimum green, then the next slice. The active spec owns the seams and acceptance boundary.

## Before the loop

- Load the spec's `Testing Decisions`, scoped `.agents/context/`, applicable rules and ADRs.
- Use the highest declared public seam. Do not create a lower seam merely because it is easier to mock.
- Use synthetic, tenant-isolated fixtures for sensitive domains.
- Read [tests.md](tests.md) and [mocking.md](mocking.md) when their examples are relevant.

## Loop

1. Write one test that fails for the missing externally observable behavior.
2. Confirm the failure is caused by that behavior, not setup, compilation or an unrelated defect.
3. Implement only enough production code to make the test pass.
4. Run the focused test and the affected package typecheck.
5. Continue with the next vertical behavior. Refactor only when the current green behavior remains protected.

## Test quality

Tests assert through public interfaces and use expected values independent from the implementation. Avoid private-method assertions, tautological expectations, internal collaborator choreography and bulk horizontal test construction. A refactor that preserves behavior should not require rewriting the test.

## Failure behavior

An unavailable test seam, non-deterministic fixture or red result without a known cause blocks implementation. Do not weaken the assertion or acceptance criterion to obtain green.

## Completion criterion

Every implemented criterion has a meaningful red-to-green history at an approved seam, focused checks are green, and the full validation remains pending until the complete implementation is assembled.
