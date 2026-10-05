---
name: pr-review
description: >
  AI code review for a PR/MR: analyze the diff, identify bugs/security/performance issues, post inline review comments, and approve when there are no findings.
  Use when the user wants to review a pull request or merge request, run code review, check PR for issues, or mentions "review pr", "pr review", "review this PR".
---

# pr-review

Detect the Git provider:

```bash
git remote get-url origin
```

- URL contains `gitlab` → follow [references/gitlab.md](references/gitlab.md)
- Otherwise → follow [references/github.md](references/github.md)
