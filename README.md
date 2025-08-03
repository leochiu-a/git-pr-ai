# Git Open-PR Tool

[![npm version](https://badge.fury.io/js/git-open-pr.svg)](https://badge.fury.io/js/git-open-pr)
[![GitHub release](https://img.shields.io/github/release/leochiu-a/git-open-pr.svg)](https://github.com/leochiu-a/git-open-pr/releases)

A tool to automatically extract JIRA ticket numbers from branch names and create GitHub Pull Requests.

## Features

- 🔍 Automatically extract JIRA ticket numbers from current git branch names (e.g., KB2C-123)
- 📋 Automatically create PR titles with JIRA tickets: `[KB2C-123] feature description`
- 🚀 Create Pull Requests directly using GitHub CLI
- ⚡ Simple `git open-pr` command for one-click operation

## Installation

Install globally via npm:

```bash
npm install -g git-open-pr
```

### Alternative: Set up git alias

After installation, you can optionally set up a git alias for easier usage:

```bash
git config --global alias.open-pr '!git-open-pr'
```

## Setup

### GitHub CLI

You need to install and authenticate with GitHub CLI:

1. Install GitHub CLI: https://cli.github.com/
2. Authenticate with GitHub:

```bash
gh auth login
```

## Usage

1. Ensure you're on a branch containing a JIRA ticket number (e.g., `feature/KB2C-123-add-new-feature`)
2. Ensure the branch is pushed to remote repository
3. Run the command:

```bash
git open-pr
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

## Development

This project is written in TypeScript and uses tsdown for bundling. The source code is in `git-open-pr.ts` and the built output is in `dist/`.

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

### Publishing

This project uses automated releases via GitHub Actions. To release a new version:

1. Update the version:
```bash
npm version patch  # or minor/major
```

2. Push the tag:
```bash
git push origin main --tags
```

This will automatically:
- Build and publish to npm
- Create a GitHub release
- Sync version information

## Example

```bash
# On branch feature/KB2C-123-add-login-page
$ git open-pr

Branch: feature/KB2C-123-add-login-page | JIRA: KB2C-123
🚀 Creating Pull Request...
✅ Pull Request created successfully!
```