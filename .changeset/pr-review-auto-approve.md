---
"git-pr-ai": minor
---

feat(skill): `pr-review` approves the PR/MR when the review has no findings

On GitHub the review is submitted as `APPROVE` when there are no Critical / Important / Minor findings, otherwise `COMMENT`. On GitLab it runs `glab mr approve` when there are no findings. It never approves your own PR/MR.
