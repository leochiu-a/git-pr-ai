# Git PR AI Tool

[![npm version](https://badge.fury.io/js/git-pr-ai.svg)](https://badge.fury.io/js/git-pr-ai)
[![GitHub release](https://img.shields.io/github/release/leochiu-a/git-pr-ai.svg)](https://github.com/leochiu-a/git-pr-ai/releases)

A tool to automatically extract JIRA ticket numbers from branch names and create GitHub Pull Requests.

## Features

- 🔍 Automatically extract JIRA ticket numbers from current git branch names (e.g., KB2C-123)
- 📋 Automatically create PR titles with JIRA tickets: `[KB2C-123] feature description`
- 🚀 Create Pull Requests directly using GitHub CLI
- ⚡ Simple `git open-pr` command for one-click operation
- 🤖 AI-powered PR description updates with `git update-pr-desc` using Claude
- 🔍 AI-powered PR code reviews with `git pr-review` using Claude

## Installation

Install globally via npm:

```bash
npm install -g git-pr-ai
```

The installation will automatically set up git aliases, so you can use `git pr-ai`, `git update-pr-desc`, and `git pr-review` directly!

## Prerequisites

Before using this tool, you need to install:

1. **GitHub CLI** - Required for creating and managing PRs
   - Install: https://cli.github.com/
   - Authenticate: `gh auth login`

2. **Claude Code** - Required for AI-powered PR descriptions (optional)
   - Install: https://docs.anthropic.com/en/docs/claude-code
   - Authenticate with your Anthropic account

## Setup

Once you have the prerequisites installed, you're ready to use the tool!

## Usage

```bash
# Create a Pull Request
$ git pr-ai
Branch: feature/KB2C-123-add-login-page | JIRA: KB2C-123
🚀 Creating Pull Request...
✅ Pull Request created successfully!

# Update PR description with AI
$ git update-pr-desc
🔍 Checking GitHub CLI...
🔍 Checking for PR on current branch...
✅ PR found! Updating description...
# Claude will then interactively help you generate the description
✅ PR description updated successfully!

# Update PR description with additional context
$ git update-pr-desc "Focus on performance improvements and add test coverage details"
🔍 Checking GitHub CLI...
🔍 Checking for PR on current branch...
📝 Additional context: Focus on performance improvements and add test coverage details
✅ PR found! Updating description...
# Claude will incorporate your additional context into the description
✅ PR description updated successfully!

# Review a Pull Request with AI
$ git pr-review
🔍 Looking for PR on current branch...
🔍 Reviewing PR #123...
🔗 PR URL: https://github.com/owner/repo/pull/123
📋 Target branch: main
🌿 Source branch: feature/KB2C-123-add-login-page
# Claude will analyze the PR and provide comprehensive review
✅ PR review completed and comment posted!

# Review a specific PR by URL
$ git pr-review https://github.com/owner/repo/pull/456
🔍 Reviewing PR from URL: https://github.com/owner/repo/pull/456
# Claude will review the specified PR
✅ PR review completed and comment posted!
```

## Branch Naming Convention

Branch names must contain JIRA ticket format, for example:
- `feature/KB2C-123-add-new-feature`
- `bugfix/PROJ-456-fix-login-issue`
- `KB2C-789-update-documentation`

The tool automatically recognizes `[A-Z]{2,}-\d+` format JIRA tickets.

## PR Title

The tool automatically generates:
- Title: `[JIRA-123] branch-name`

## Custom Configuration

You can modify the following settings in `git-pr-ai.js`:
- Target branch (default is `main`)
- JIRA domain links
- PR description template

## Troubleshooting

### Common Errors

1. **Unable to extract JIRA ticket number**
   - Ensure branch name contains correct JIRA ticket format

2. **GitHub CLI not installed**
   - Install GitHub CLI from https://cli.github.com/

3. **GitHub CLI not authenticated**
   - Run `gh auth login` to authenticate

4. **Repository information error**
   - Ensure current directory is a git repository
   - Ensure remote origin points to GitHub repository

5. **No PR found for current branch**
   - Create a PR first using `git pr-ai`
   - Or switch to a branch that has an existing PR

6. **Claude Code not installed**
   - Install Claude Code from https://docs.anthropic.com/en/docs/claude-code
   - Ensure it's properly authenticated

## Development

This project is written in TypeScript and uses tsdown for bundling. The source code is in `src/cli/` and the built output is in `dist/`.

### Commands Available

- `git-pr-ai` / `git pr-ai` - Create a new Pull Request
- `git-update-pr-desc` / `git update-pr-desc` - Update PR description using AI
  - Usage: `git update-pr-desc [additional-context]`
  - Example: `git update-pr-desc "Focus on security improvements"`
- `git-pr-review` / `git pr-review` - Review Pull Request using AI
  - Usage: `git pr-review [pr-url]`
  - Example: `git pr-review` (review current branch PR)
  - Example: `git pr-review https://github.com/owner/repo/pull/123`

### Local Development

1. Clone this repository:
```bash
git clone https://github.com/leochiu-a/git-pr-ai.git
cd git-pr-ai
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm run build
```
