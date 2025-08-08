# Installation

This guide will walk you through installing Git PR AI Tool and setting up the required dependencies.

## Requirements

- **Node.js**: Version 20.0.0 or higher
- **Git**: Installed and configured
- **GitHub CLI**: Required for PR operations
- **AI Provider**: Claude Code or Gemini CLI (for AI features)

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

## Step 2: Install GitHub CLI

To install the GitHub CLI (`gh`), please follow these steps:

1. Visit the official GitHub CLI website: https://cli.github.com/
2. Follow the installation instructions provided on the website for your platform.

For example, on macOS you can use Homebrew:

```bash
brew install gh
```

## Step 3: Install an AI Provider

Choose one of the following AI providers for enhanced features:

### Option A: Claude Code (Recommended)

Claude Code provides excellent code understanding and generation capabilities.

1. Visit the [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code)
2. Follow the installation instructions for your platform
3. Ensure Claude Code is properly authenticated

### Option B: Gemini CLI

Gemini CLI offers powerful AI assistance for code-related tasks.

1. Install the Gemini CLI tool following Google's official documentation
2. Configure authentication as required

## Step 4: Verify Installation

Run the following commands to verify everything is installed correctly:

```bash
# Check Git PR AI Tool
git pr-ai --help

# Check GitHub CLI
gh --version

# Check your chosen AI provider
# For Claude Code: ensure it's accessible in your terminal
# For Gemini CLI: check according to its documentation
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

- [Learn about available commands](./commands)
- [Configure JIRA integration](./configuration)
- [Start creating branches and PRs](./usage)
