# git create-branch

Create a new git branch using JIRA ticket information with AI-powered naming. The AI generates **3 branch name options** with different perspectives, allowing you to choose the one that best fits your needs.

<iframe width="560" height="315" src="https://www.youtube.com/embed/g3tZKUHTidI?si=jOSHcmo1xT30hRmP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Usage

```bash
git create-branch [OPTIONS]
```

Three main modes available:

- `--jira <ticket>` - Use JIRA ticket information
- `--git-diff` - Analyze current uncommitted changes
- `--prompt <description>` - Use custom description

## Options

| Option              | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `--jira <ticket>`   | Specify JIRA ticket ID or URL (e.g., PROJ-123 or full URL) |
| `--git-diff`        | Generate branch name based on current git diff             |
| `--prompt <prompt>` | Generate branch name based on custom prompt                |
| `--move`, `-m`      | Rename current branch instead of creating a new one        |

## Features

- **JIRA Integration**: Fetches ticket information automatically
- **AI-Powered**: Generates 3 branch name options to choose from
- **Multiple Modes**: Works with JIRA tickets, git diff, or custom prompts
- **Branch Rename**: Can rename existing branches with `--move` option

## Examples

### JIRA Ticket Mode

```bash
# Create a feature branch for JIRA ticket (using ticket ID)
git create-branch --jira PROJ-123
# → Fetches ticket details and generates 3 options:
#   1. feat/PROJ-123-add-user-login
#   2. feat/PROJ-123-implement-user-authentication
#   3. feat/PROJ-123-user-authentication-system
# → Select your preferred option from the interactive menu

```

### Git Diff Mode

```bash
# Analyze your uncommitted changes
git create-branch --git-diff
# → AI analyzes your staged/unstaged changes and generates options:
#   1. feat/add-password-validation
#   2. feat/implement-password-checks
#   3. feat/password-validation-system
# → Select the option that best matches your intent


```

### Custom Prompt Mode

```bash
# Create branch from description
git create-branch --prompt "Implement OAuth integration"
# → Generates 3 options:
#   1. feat/implement-oauth-integration
#   2. feat/add-oauth-support
#   3. feat/oauth-authentication-integration
# → Select your preferred naming style

```
