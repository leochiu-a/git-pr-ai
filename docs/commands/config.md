# git pr-ai config

Configure Git PR AI Tool settings.

## Usage

```bash
git pr-ai config
```

## Features

- **AI Provider Selection**: Choose any supported provider (see [AI Providers](../introduction/ai-providers))
- **JIRA Configuration**: Set up JIRA integration
- **Configuration File**: Creates `~/.git-pr-ai/.git-pr-ai.json`

For detailed configuration options and advanced settings, see the [Configuration Guide](../configuration).

## Options

| Option           | Description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| `-f, --force`    | Force overwrite existing configuration without confirmation            |
| `-o, --open`     | Open the existing configuration file in your editor                    |
| `-a, --agent`    | Configure the AI agent only                                            |
| `-p, --provider` | Configure the Git provider preference (auto-detect, GitHub, or GitLab) |
| `-l, --language` | Configure the CLI language only                                        |
| `-j, --jira`     | Configure JIRA integration only                                        |
| `-m, --model`    | Configure the AI model for a specific command                          |
| `-h, --help`     | Display help for the command                                           |

Most GitHub users can skip the `--provider` option—the CLI detects GitHub automatically. Configure it if your GitLab installation uses a custom domain or nonstandard remote URL.

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
