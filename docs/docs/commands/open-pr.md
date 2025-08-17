# git open-pr

Create or open a Pull Request for the current branch (works with both GitHub and GitLab).

## Usage

```bash
# Create PR with automatic JIRA detection
git open-pr

# Create PR with manual JIRA ticket
git open-pr --jira PROJ-123
```

## Options

- `--jira <ticket>`: Manually specify JIRA ticket ID

## Features

- **Multi-Platform Support**: Works with both GitHub and GitLab automatically
- **Smart PR Detection**: Opens existing PR if one already exists
- **Automatic JIRA Detection**: Extracts JIRA ticket from branch name
- **Enhanced Titles**: Format: `[JIRA-123] ticket-title`
- **Fallback Support**: Uses branch name if no JIRA ticket found

## Examples

```bash
# From branch: feature/PROJ-123-add-login
git open-pr
# → Creates PR with title: "[PROJ-123] Add user login functionality"

# Manual JIRA specification
git open-pr --jira PROJ-456
# → Creates PR with title: "[PROJ-456] Fix authentication bug"
```
