# Commands Reference

Git PR AI Tool provides several commands to streamline your development workflow. All commands are available as git aliases after installation.

## Available Commands

### Branch and PR Management

- **[git create-branch](./create-branch)** - Create a new git branch using JIRA ticket information with AI-powered naming
- **[git ai-commit](./ai-commit)** - Generate AI-powered commit messages based on your code changes
- **[git open-pr](./open-pr)** - Create or open a Pull Request for the current branch (works with both GitHub and GitLab)
- **[git update-pr-desc](./update-pr-desc)** - Update Pull Request description using AI assistance
- **[git pr-review](./pr-review)** - Get AI-powered code review for a Pull Request

### Issue Planning and Implementation

- **[git plan-issue](./plan-issue)** - Smart Issue Planning — analyze GitHub issues and create implementation plans, or convert JIRA tickets to Git platform issues
- **[git take-issue](./take-issue)** - Execute a development plan for a specific issue using AI assistance

### Reporting

- **[git weekly-summary](./weekly-summary)** - Generate a weekly summary of git activity and accomplishments

### Configuration

- **[git pr-ai config](./config)** - Configure Git PR AI Tool settings

## Quick Start

```bash
# Configure the tool (first time setup)
git pr-ai config

# Create a feature branch
git create-branch --jira PROJ-123

# Create AI-powered commit
git ai-commit
git ai-commit "explain why the change was needed"

# Open a Pull Request
git open-pr

# Get AI review
git pr-review
```

## Command Aliases

After installation, these git aliases are automatically configured:

```bash
git pr-ai config    # Configure the tool
git create-branch   # Create new branch
git ai-commit       # Generate AI commit message
git open-pr         # Create/open Pull Request
git update-pr-desc  # Update PR description
git pr-review       # Review Pull Request
git plan-issue      # Generate implementation plan from JIRA ticket
git take-issue      # Start working on an issue
```
