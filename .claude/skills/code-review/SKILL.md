---
name: code-review
description: >
  AI code review for a PR/MR: analyze the diff, identify bugs/security/performance issues, and post inline review comments.
  Use when the user wants to review a pull request or merge request, run code review, check PR for issues, or mentions "review pr", "pr review", "review this PR".
---

# code-review

Detect the Git provider:

```bash
git remote get-url origin
```

- URL contains `gitlab` → follow [references/gitlab.md](references/gitlab.md)
- Otherwise → follow [references/github.md](references/github.md)
