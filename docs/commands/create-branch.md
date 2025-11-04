# git create-branch

Create a new git branch using JIRA ticket information with AI-powered naming. The AI generates **3 branch name options** with different perspectives, allowing you to choose the one that best fits your needs.

<iframe width="560" height="315" src="https://www.youtube.com/embed/GV32oLf3tcM?si=DMkRwYqHZWMynbyR" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

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

- **JIRA Integration**: Automatically fetches JIRA ticket title
- **AI-Powered Naming**: Uses Claude or Gemini to generate 3 branch name options with different perspectives
- **Interactive Selection**: Choose from multiple AI-generated branch name options via an intuitive selection interface
- **Smart Branch Types**: AI determines appropriate branch type (feat, fix, docs, etc.)
- **Diverse Options**: Each option offers a different approach (conservative, alternative wording, detailed)
- **Existing Branch Handling**: Gracefully handles existing branches
- **Simple Base Branch Logic**: Uses current branch as base
- **Backward Compatible**: Supports legacy single branch name format

## How It Works

When you run `git create-branch`, the AI analyzes your input (JIRA ticket, git diff, or custom prompt) and generates **3 branch name options**:

1. **Option 1**: Most conservative/straightforward interpretation
2. **Option 2**: Alternative approach with different wording
3. **Option 3**: Most detailed/comprehensive approach

You'll be presented with an interactive selection menu where you can use arrow keys to choose your preferred branch name. This gives you flexibility while still benefiting from AI-powered suggestions.

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

# Create a feature branch using full JIRA URL
git create-branch --jira https://xxxx.atlassian.net/browse/KB2CW-2684
# → Extracts ticket ID and generates multiple branch name options
# → Choose the option that best describes your work

# Rename current branch with JIRA info
git create-branch --jira PROJ-456 --move
# → Generates options like:
#   1. fix/PROJ-456-resolve-memory-leak
#   2. fix/PROJ-456-fix-memory-issue
#   3. fix/PROJ-456-memory-leak-in-cache
# → Select and rename current branch
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

# Rename current branch based on changes
git create-branch --git-diff --move
# → Generates branch name options based on your diff
# → Choose and apply to current branch
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

# More complex description
git create-branch --prompt "Fix memory leak in user cache system"
# → Generates options like:
#   1. fix/memory-leak-user-cache
#   2. fix/resolve-cache-memory-issue
#   3. fix/user-cache-memory-leak-system
# → Choose the most appropriate branch name
```
