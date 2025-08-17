# git pr-ai config

Configure Git PR AI Tool settings.

## Usage

```bash
git pr-ai config
```

## Features

- **AI Provider Selection**: Choose between Claude and Gemini
- **JIRA Configuration**: Set up JIRA integration
- **Configuration File**: Creates `~/.git-pr-ai/.git-pr-ai.json`

For detailed configuration options and advanced settings, see the [Configuration Guide](../configuration).

## Command Aliases

After installation, these git aliases are automatically configured:

```bash
git pr-ai config    # Configure the tool
git open-pr         # Create/open Pull Request
git create-branch   # Create new branch
git update-pr-desc  # Update PR description
git pr-review       # Review Pull Request
git plan-issue      # Generate implementation plan from JIRA ticket
git take-issue      # Start working on an issue
```
