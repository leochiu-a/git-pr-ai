---
'git-pr-ai': patch
---

Add --jira option to manually specify JIRA ticket ID in open-pr command

- Users can now specify JIRA ticket ID manually with `git open-pr --jira PROJ-123`
- Falls back to automatic extraction from branch name if --jira option is not provided
- Updated help documentation and README with usage examples
