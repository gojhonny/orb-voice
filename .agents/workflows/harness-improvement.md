# Harness improvement workflow

Use when `harness-score` or repository audits identify a gap in agent guidance, skills, workflows, hooks, sensors, CI, or hygiene.

1. Run `orbv harness .` and record the six dimension scores.
2. Map each missing check to the smallest useful repository artifact; do not add decorative files solely for points.
3. Update the relevant harness SPEC and ADR/rule when the change creates a durable constraint.
4. Prefer reusable skills for repeated procedures and workflows for explicitly invoked sequences.
5. Prefer runtime hooks only for fast, deterministic safety or feedback behavior.
6. Keep destructive/release operations human-controlled.
7. Add or update a deterministic audit for any new harness invariant.
8. Run `orbv audit` and `orbv check`.
9. Re-run `orbv harness .` and record the score delta in the SPEC evidence.
