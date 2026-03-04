---
'git-pr-ai': minor
---

Standardize non-interactive CLI behavior across PR and commit workflows.

- Add `--non-interactive` and `--ci` support to `git open-pr`, `git create-branch`, and `git ai-commit` for automation-friendly usage.
- Replace `git open-pr --no-web` usage with the unified non-interactive flags.
- Refine non-interactive execution for `git pr-review` and `git update-pr-desc` to capture AI output and apply it directly.
- Remove `--yolo` exposure from `open-pr`, `create-branch`, and `ai-commit`, while keeping shared non-interactive resolution behavior for backward compatibility where needed.
