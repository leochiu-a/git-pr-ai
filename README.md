# Git PR AI Tool

[![npm version](https://badge.fury.io/js/git-pr-ai.svg)](https://badge.fury.io/js/git-pr-ai)
[![GitHub release](https://img.shields.io/github/release/leochiu-a/git-pr-ai.svg)](https://github.com/leochiu-a/git-pr-ai/releases)

A tool to automatically extract JIRA ticket numbers from branch names and create GitHub Pull Requests.

## Features

- 🔍 Automatically extract JIRA ticket numbers from current git branch names (e.g., KB2C-123)
- 📋 Automatically create PR titles with JIRA tickets: `[KB2C-123] feature description`
- 🚀 Create Pull Requests directly using GitHub CLI
- ⚡ Simple `git open-pr` command for one-click operation
- 🤖 AI-powered PR description updates with `git update-pr-desc` using Claude or Gemini
- 🔍 AI-powered PR code reviews with `git pr-review` using Claude or Gemini

## Installation

Install globally via npm:

```bash
pnpm add -g git-pr-ai
```

The installation will automatically set up git aliases, so you can use `git pr-ai init`, `git open-pr`, `git update-pr-desc`, and `git pr-review` directly!

## Prerequisites

Before using this tool, you need to install:

1. **GitHub CLI** - Required for creating and managing PRs
   - Install: https://cli.github.com/
   - Authenticate: `gh auth login`

2. **AI Provider** - Required for AI-powered feature (Choose only one)
   - **Claude Code**
   - **Gemini CLI**

## Usage

### 1. Create a Pull Request

```bash
git open-pr
```

**What it does:**

- Extracts JIRA ticket number from current branch name `feature/KB2C-123-add-login-page`
- Creates PR title in format: `[JIRA-123] branch-name`
- Uses GitHub CLI to create PR

### 2. Update PR Description with AI

**Basic usage:**

```bash
git update-pr-desc
```

**With additional context:**

```bash
git update-pr-desc "Focus on performance improvements and add test coverage details"
```

**Example Output:**

```
🔍 Checking for PR on current branch...
🔗 PR URL: https://github.com/owner/repo/pull/123
📋 Target branch: main
🌿 Current branch: feature/KB2C-123-add-login-page
🤖 Using CLAUDE for AI assistance
📝 Additional context: Focus on performance improvements and add test coverage details
# AI will then interactively help you generate the description
✅ PR description updated successfully!
```

### 3. Review Pull Request with AI

**Review current branch PR:**

```bash
git pr-review
```

**Review specific PR by URL:**

```bash
git pr-review https://github.com/owner/repo/pull/456
```

**Example Output:**

```
🔍 Looking for PR on current branch...
🔍 Reviewing PR #123 using CLAUDE...
🔗 PR URL: https://github.com/owner/repo/pull/123
📋 Target branch: main
🌿 Source branch: feature/KB2C-123-add-login-page
# AI will analyze the PR and provide comprehensive review
✅ PR review completed and comment posted!
```

## Configuration (Optional)

The default agent is Claude. You can run the setup command to create your configuration:

```bash
git pr-ai init
```

The command will create a `.git-pr-ai.json` file in your project root with your selection.

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
   - Create a PR first using `git open-pr`
   - Or switch to a branch that has an existing PR

6. **AI Provider not installed**
   - For Claude: Install Claude Code from https://docs.anthropic.com/en/docs/claude-code
   - For Gemini: Install the Gemini CLI tool
   - Ensure your chosen provider is properly authenticated

## Contributing

This project is written in TypeScript and uses tsdown for bundling. To contribute:

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
