# git create-branch

Create a new git branch using JIRA ticket information with AI-powered naming.

## Usage

```bash
git create-branch [OPTIONS]
```

Three main modes available:

- `--jira <ticket>` - Use JIRA ticket information
- `--git-diff` - Analyze current uncommitted changes
- `--prompt <description>` - Use custom description

## Options

| Option              | Description                                         |
| ------------------- | --------------------------------------------------- |
| `--jira <ticket>`   | Specify JIRA ticket ID (e.g., PROJ-123)             |
| `--git-diff`        | Generate branch name based on current git diff      |
| `--prompt <prompt>` | Generate branch name based on custom prompt         |
| `--move`, `-m`      | Rename current branch instead of creating a new one |

## Features

- **JIRA Integration**: Automatically fetches JIRA ticket title
- **AI-Powered Naming**: Uses Claude or Gemini to generate optimal branch names
- **Smart Branch Types**: AI determines appropriate branch type (feat, fix, docs, etc.)
- **Existing Branch Handling**: Gracefully handles existing branches
- **Simple Base Branch Logic**: Uses current branch as base

## Examples

### JIRA Ticket Mode

```bash
# Create a feature branch for JIRA ticket
git create-branch --jira PROJ-123
# → Fetches ticket details and creates: feat/PROJ-123-add-user-login

# Rename current branch with JIRA info
git create-branch --jira PROJ-456 --move
# → Renames current branch to: fix/PROJ-456-resolve-memory-leak
```

### Git Diff Mode

```bash
# Analyze your uncommitted changes
git create-branch --git-diff
# → AI analyzes your staged/unstaged changes and suggests branch name
# → Example output: feat/add-password-validation

# Rename current branch based on changes
git create-branch --git-diff --move
```

### Custom Prompt Mode

```bash
# Create branch from description
git create-branch --prompt "Implement OAuth integration"
# → Creates: feat/implement-oauth-integration

# More complex description
git create-branch --prompt "Fix memory leak in user cache system"
# → Creates: fix/memory-leak-user-cache-system
```
