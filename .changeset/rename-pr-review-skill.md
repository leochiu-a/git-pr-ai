---
"git-pr-ai": patch
---

refactor(skill): rename the `code-review` skill back to `pr-review`

The skill directory is now `.claude/skills/pr-review/`, and its reference files are bundled to `dist/references/pr-review/`. The `git pr-review` CLI command and all "code review" wording in the docs are unchanged.
