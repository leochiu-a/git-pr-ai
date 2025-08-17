# git create-branch

Create a new git branch using JIRA ticket information with AI-powered naming.

## Usage

```bash
# Create branch from JIRA ticket
git create-branch --jira PROJ-123

# Create branch from git diff
git create-branch --git-diff

# Create branch from custom prompt
git create-branch --prompt "Add user authentication system"

# Rename current branch instead of creating new one
git create-branch --jira PROJ-123 --move
git create-branch --git-diff -m
git create-branch --prompt "Fix memory leak" -m
```

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

```bash
# Create a feature branch for JIRA ticket
git create-branch --jira PROJ-123
# → Creates: feat/PROJ-123-add-user-login

# Create branch based on your changes
git create-branch --git-diff
# → Analyzes your uncommitted changes and creates appropriate branch

# Create branch from description
git create-branch --prompt "Implement OAuth integration"
# → Creates: feat/implement-oauth-integration

# Rename current branch
git create-branch --jira PROJ-456 --move
# → Renames current branch to: fix/PROJ-456-resolve-memory-leak
```
