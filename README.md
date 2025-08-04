# Git Open-PR Tool

[![npm version](https://badge.fury.io/js/git-open-pr.svg)](https://badge.fury.io/js/git-open-pr)
[![GitHub release](https://img.shields.io/github/release/leochiu-a/git-open-pr.svg)](https://github.com/leochiu-a/git-open-pr/releases)

A tool to automatically extract JIRA ticket numbers from branch names and create GitHub Pull Requests.

## Features

- 🔍 Automatically extract JIRA ticket numbers from current git branch names (e.g., KB2C-123)
- 📋 Automatically create PR titles with JIRA tickets: `[KB2C-123] feature description`
- 🚀 Create Pull Requests directly using GitHub CLI
- ⚡ Simple `git open-pr` command for one-click operation
- 🤖 AI-powered PR description updates with `git update-pr-desc` using Claude

## Installation

Install globally via npm:

```bash
npm install -g git-open-pr
```

The installation will automatically set up git aliases, so you can use `git open-pr` and `git update-pr-desc` directly!

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
$ git open-pr
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

You can modify the following settings in `git-open-pr.js`:
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
   - Create a PR first using `git open-pr`
   - Or switch to a branch that has an existing PR

6. **Claude Code not installed**
   - Install Claude Code from https://docs.anthropic.com/en/docs/claude-code
   - Ensure it's properly authenticated

## Development

This project is written in TypeScript and uses tsdown for bundling. The source code is in `src/cli/` and the built output is in `dist/`.

### Commands Available

- `git-open-pr` / `git open-pr` - Create a new Pull Request
- `git-update-pr-desc` / `git update-pr-desc` - Update PR description using AI

### Local Development

1. Clone this repository:
```bash
git clone https://github.com/leochiu-a/git-open-pr.git
cd git-open-pr
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm run build
```
