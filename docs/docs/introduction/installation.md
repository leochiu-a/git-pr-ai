# Installation

This guide will walk you through installing Git PR AI Tool and setting up the required dependencies.

## Requirements

- **Node.js**: Version 20.0.0 or higher
- **Git**: Installed and configured
- **Platform CLI**: GitHub CLI (gh) or GitLab CLI (glab) for PR operations
- **AI Provider**: Claude Code (required for AI features)

## Step 1: Install Git PR AI Tool

Install the tool globally using your preferred package manager:

```bash
# Using pnpm (recommended)
pnpm add -g git-pr-ai

# Using npm
npm install -g git-pr-ai

# Using yarn
yarn global add git-pr-ai
```

The installation automatically sets up git aliases, so you can use these commands directly:

- `git pr-ai config`
- `git open-pr`
- `git create-branch`
- `git update-pr-desc`
- `git pr-review`

## Step 2: Install Platform CLI

Choose the appropriate CLI tool based on your platform:

### For GitHub Users

Install the GitHub CLI (`gh`):

```bash
# macOS
brew install gh
```

Visit https://cli.github.com/ for more installation options.

### For GitLab Users

Install the GitLab CLI (`glab`):

```bash
brew install glab
```

Visit https://gitlab.com/gitlab-org/cli for more installation options.

## Step 3: Install Claude Code (Required)

Claude Code is required for AI-powered features like PR description generation and code reviews.

1. Visit the [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code)
2. Follow the installation instructions for your platform
3. Ensure Claude Code is properly authenticated with your Anthropic account

Claude Code provides:

- Intelligent code analysis
- Automatic PR description generation
- Comprehensive code reviews
- Context-aware suggestions

## Step 4: Verify Installation

Run the following commands to verify everything is installed correctly:

```bash
# Check Git PR AI Tool
git pr-ai --help

# Check Platform CLI
gh --version      # For GitHub users
glab --version    # For GitLab users

# Check Claude Code
claude --version  # Ensure Claude Code is installed and accessible
```

## Step 5: Optional Configuration

While the tool works with default settings, you can customize it:

```bash
git pr-ai config
```

This command will:

- Let you choose between Claude and Gemini
- Create a configuration file at `~/.git-pr-ai/.git-pr-ai.json`
- Set up JIRA integration if needed

## Next Steps

Once installed, you can:

- [Learn about available commands](../commands)
- [Configure JIRA integration](../configuration)
- [Start creating branches and PRs](./usage)
