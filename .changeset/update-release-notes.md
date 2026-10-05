---
"git-pr-ai": minor
---

feat(cli): show what's new before upgrading

When a newer `git-pr-ai` is available, the upgrade prompt first lists the changes in every release between the installed version and the latest one (from the GitHub Releases), with a link to the full release notes. If GitHub can't be reached, the list is skipped and the prompt shows as before.
