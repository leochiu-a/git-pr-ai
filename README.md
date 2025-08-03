# Git Open-PR Tool

A tool to automatically extract JIRA ticket numbers from branch names and create GitHub Pull Requests.

## Features

- 🔍 Automatically extract JIRA ticket numbers from current git branch names (e.g., KB2C-123)
- 📋 Automatically create PR titles with JIRA tickets: `[KB2C-123] feature description`
- 🚀 Create Pull Requests directly using GitHub CLI
- ⚡ Simple `git open-pr` command for one-click operation

## Installation

1. Clone this repository locally:
```bash
git clone <repository-url>
cd git-open-pr
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Set up git alias:
```bash
git config --global alias.open-pr '!/Users/leochiu/Desktop/git-open-pr/dist/git-open-pr.js'
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

### Building

```bash
npm run build
```

This creates an optimized bundle in the `dist/` directory.

## Example

```bash
# On branch feature/KB2C-123-add-login-page
$ git open-pr

Branch: feature/KB2C-123-add-login-page | JIRA: KB2C-123
🚀 Creating Pull Request...
✅ Pull Request created successfully!
```