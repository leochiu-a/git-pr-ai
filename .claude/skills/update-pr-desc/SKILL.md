---
name: update-pr-desc
description: >
  AI-generate and auto-apply a PR description from the diff using the repo's PR template.
  Use when the user wants to update or generate a PR description for the current branch.
---

# Update PR Description

Detect the Git provider:

```bash
git remote get-url origin
```

- URL contains `gitlab` → follow [references/gitlab.md](references/gitlab.md)
- Otherwise → follow [references/github.md](references/github.md)
