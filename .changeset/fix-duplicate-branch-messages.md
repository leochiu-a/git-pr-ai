---
"git-pr-ai": patch
---

fix: remove duplicate branch renaming messages in create-branch command

Remove redundant "Renaming branch" message to avoid duplication with "Generated branch name" message, providing cleaner output when using the --move option.