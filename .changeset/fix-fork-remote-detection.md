---
"git-pr-ai": patch
---

fix(open-pr): correctly detect fork workflow when both origin and upstream remotes exist

Previously, `gh repo view` (without an explicit repo argument) would resolve to the upstream org repo and return `isFork: false`, causing the owner filter in PR lookup to reject the existing PR and failing to create new PRs with the correct `owner:branch` head ref.

`getRepoContext` now uses a three-step resolution:
1. Parse `current` from `git remote get-url origin` directly
2. If an `upstream` remote exists and differs from `origin`, treat as fork workflow
3. Fall back to `gh repo view <current>` (explicit repo) for GitHub-registered forks without a local upstream remote

Also fixes `git update-pr-desc` to pass `prDetails.url` instead of `prDetails.number` to `gh pr edit`, so the target repo is always resolved unambiguously.
