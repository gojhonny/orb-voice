---
description: Scopes agent-native workflows, Cursor runtime hooks, shell safety decisions, edit feedback, reviewer subagents, and harness-score CI enforcement.
globs:
  - ".agents/skills/**"
  - ".agents/workflows/**"
  - ".cursor/**"
  - ".github/workflows/**"
  - ".audits/**"
  - "AGENTS.md"
---

# Rule 012: Agent runtime guardrails

- Effective: 2026-09-04
- Priority: Critical
- Applies: Agent skills, workflows, Cursor hooks/subagents, and harness maturity checks

1. Every `SKILL.md` declares YAML frontmatter with a stable `name` and a description that explains when the skill should activate.
2. Workflows orchestrate existing rules, skills, and real Orbu commands; they must not invent a second CLI or duplicate product requirements.
3. The shell gate must deny package publication, force pushes, hard resets, destructive Git clean operations, hook bypasses, and recursive deletion of root/home locations.
4. Release-boundary Git operations such as normal pushes, tag creation, merges/rebases, and PR merge must require human approval.
5. Malformed or missing shell-hook input must request approval instead of silently allowing execution.
6. The edit feedback hook is advisory, repository-local, fast, and limited to supported files inside the workspace.
7. Hooks must not send repository data over the network or embed credentials.
8. Hook scripts are committed, dependency-free Node.js utilities; this exception does not change Rule 008's POSIX-shell-only requirement for the Orbu CLI.
9. CI must expose lint, typecheck, and test sensors as explicit steps and enforce the pinned harness-score maturity target.
10. Harness improvements must preserve product runtime behavior unless a separate product SPEC explicitly changes it.
