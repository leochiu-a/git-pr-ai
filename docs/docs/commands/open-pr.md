# git open-pr

Create or open a Pull Request for the current branch (works with both GitHub and GitLab).

## Usage

```bash
git open-pr [--jira <ticket>]
```

- **Default**: Automatically detects JIRA ticket from branch name
- **Manual**: Override with specific JIRA ticket ID

## Options

| Option            | Description                     |
| ----------------- | ------------------------------- |
| `--jira <ticket>` | Manually specify JIRA ticket ID |

## Features

- **Multi-Platform Support**: Works with both GitHub and GitLab automatically
- **Smart PR Detection**: Opens existing PR if one already exists
- **Automatic JIRA Detection**: Extracts JIRA ticket from branch name
- **Enhanced Titles**: Format: `[JIRA-123] ticket-title`
- **Fallback Support**: Uses branch name if no JIRA ticket found

## Examples

### Automatic JIRA Detection

```bash
# From branch: feature/PROJ-123-add-login
git open-pr
# → Extracts JIRA-123 from branch name
# → Creates PR with title: "[PROJ-123] Add user login functionality"

# From branch: fix/PROJ-456-auth-issue
git open-pr
# → Creates PR with title: "[PROJ-456] Fix authentication issue"
```

### Manual JIRA Override

```bash
# Override detected JIRA ticket
git open-pr --jira PROJ-999
# → Creates PR with title: "[PROJ-999] Custom ticket title"

# Specify JIRA when branch has no ticket info
git open-pr --jira PROJ-456
# → Creates PR with title: "[PROJ-456] Fix authentication bug"
```

### Smart PR Handling

```bash
# If PR already exists
git open-pr
# → Opens existing PR in browser instead of creating duplicate

# Works with both GitHub and GitLab
git open-pr
# → Automatically detects platform and creates appropriate PR/MR
```
