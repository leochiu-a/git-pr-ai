---
name: fix-pr-comments
description: >
  Fix a PR/MR review comment by fetching its details, applying the code fix,
  committing the change, and replying to the comment. Supports both GitHub and
  GitLab. Use when the user wants to resolve PR/MR review comments — either a
  specific comment URL, or all open comments on the current PR/MR. Triggers on
  phrases like "fix this comment [URL]", "resolve this PR comment", "fix pr
  comment [URL]", "fix this MR comment", "fix all PR comments", "address all
  review comments", or any request to address GitHub PR or GitLab MR review
  comments with or without a link.
---

# Fix PR/MR Comments

Follow [references/workflow.md](references/workflow.md) for the full fix workflow
(mode detection, fetch, fix, commit, push, reply).

Detect the Git provider and read the matching platform reference for field
descriptions and reply commands:

```bash
git remote get-url origin
```

- URL contains `gitlab` → [references/gitlab.md](references/gitlab.md)
- Otherwise → [references/github.md](references/github.md)
