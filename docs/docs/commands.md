# Commands Reference

Git PR AI Tool provides several commands to streamline your development workflow. All commands are available as git aliases after installation.

## git create-branch

Create a new git branch using JIRA ticket information with AI-powered naming.

### Usage

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

### Options

- `--jira <ticket>`: Specify JIRA ticket ID (e.g., PROJ-123)
- `--git-diff`: Generate branch name based on current git diff
- `--prompt <prompt>`: Generate branch name based on custom prompt
- `--move`, `-m`: Rename current branch instead of creating a new one

### Features

- **JIRA Integration**: Automatically fetches JIRA ticket title
- **AI-Powered Naming**: Uses Claude or Gemini to generate optimal branch names
- **Smart Branch Types**: AI determines appropriate branch type (feat, fix, docs, etc.)
- **Existing Branch Handling**: Gracefully handles existing branches
- **Simple Base Branch Logic**: Uses current branch as base

### Examples

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

## git open-pr

Create or open a Pull Request for the current branch (works with both GitHub and GitLab).

### Usage

```bash
# Create PR with automatic JIRA detection
git open-pr

# Create PR with manual JIRA ticket
git open-pr --jira PROJ-123
```

### Options

- `--jira <ticket>`: Manually specify JIRA ticket ID

### Features

- **Multi-Platform Support**: Works with both GitHub and GitLab automatically
- **Smart PR Detection**: Opens existing PR if one already exists
- **Automatic JIRA Detection**: Extracts JIRA ticket from branch name
- **Enhanced Titles**: Format: `[JIRA-123] ticket-title`
- **Fallback Support**: Uses branch name if no JIRA ticket found

### Examples

```bash
# From branch: feature/PROJ-123-add-login
git open-pr
# → Creates PR with title: "[PROJ-123] Add user login functionality"

# Manual JIRA specification
git open-pr --jira PROJ-456
# → Creates PR with title: "[PROJ-456] Fix authentication bug"
```

## git update-pr-desc

Update Pull Request description using AI assistance.

### Usage

```bash
# Update PR description with AI
git update-pr-desc

# Update with additional context
git update-pr-desc "Focus on performance improvements and add test coverage details"
```

### Features

- **AI-Powered Descriptions**: Uses Claude Code for intelligent content generation
- **Smart Analysis**: AI analyzes your code changes automatically without manual diff input
- **Platform Agnostic**: Works with both GitHub and GitLab Pull Requests
- **Context Aware**: Understands your repository structure and changes
- **Additional Context**: Accepts custom context for focused descriptions

### Example Output

```
🔍 Checking for PR on current branch...
🔗 PR URL: https://github.com/owner/repo/pull/123
📋 Target branch: main
🌿 Current branch: feature/PROJ-123-add-login
🤖 Using CLAUDE for AI assistance
📝 Additional context: Focus on performance improvements
# Interactive AI session begins...
✅ PR description updated successfully!
```

## git pr-review

Get AI-powered code review for a Pull Request.

### Usage

```bash
# Review current branch PR
git pr-review
```

### Features

- **Comprehensive Analysis**: Reviews code changes, structure, and best practices
- **AI-Powered Insights**: Uses Claude or Gemini for intelligent feedback
- **Automatic PR Detection**: Finds PR for current branch
- **Direct Comments**: Posts review comments directly to GitHub

### Example Output

```
🔍 Looking for PR on current branch...
🔍 Reviewing PR #123 using CLAUDE...
🔗 PR URL: https://github.com/owner/repo/pull/123
📋 Target branch: main
🌿 Source branch: feature/PROJ-123-add-login
# AI analyzes the PR and provides comprehensive review...
✅ PR review completed and comment posted!
```

## git plan-issue

Smart Issue Planning — analyze GitHub issues and create implementation plans, or convert JIRA tickets to Git platform issues.

### Usage

```bash
# Plan from an existing GitHub issue
git plan-issue --issue 42

# Convert a JIRA ticket to a Git platform issue
git plan-issue --jira PROJ-123
```

### Options

- `--issue <number>`: GitHub issue number to plan
- `--jira <key>`: JIRA ticket key to convert to Git platform issue

Note: Provide either `--issue` or `--jira` (not both).

### Modes

- **Optimize**: Improve existing issue content for clarity and actionability
- **Comment**: Provide analysis and solution recommendations
- **JIRA**: Convert JIRA ticket to Git platform issue format

### Features

- **AI-powered enhancement**: Optimize or generate solution commentary
- **Interactive actions**: Replace content / add comment / save to file
- **JIRA integration**: Fetches ticket details and converts to issue

## git pr-ai config

Configure Git PR AI Tool settings.

### Usage

```bash
git pr-ai config
```

### Features

- **AI Provider Selection**: Choose between Claude and Gemini
- **JIRA Configuration**: Set up JIRA integration
- **Configuration File**: Creates `~/.git-pr-ai/.git-pr-ai.json`

## Command Aliases

After installation, these git aliases are automatically configured:

```bash
git pr-ai config    # Configure the tool
git open-pr         # Create/open Pull Request
git create-branch   # Create new branch
git update-pr-desc  # Update PR description
git pr-review       # Review Pull Request
git plan-issue      # Generate implementation plan from JIRA ticket
```
