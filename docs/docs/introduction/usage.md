# Usage Guide

This guide demonstrates how to use Git PR AI Tool in your daily development workflow with practical examples and best practices.

## Full Workflow

The typical workflow with Git PR AI Tool follows these steps:

1. **Plan the issue** with AI
2. **Take the issue** and implement with AI
3. **Create a branch** based on JIRA ticket or task description
4. **Make your changes** and commit them
5. **Create a Pull Request** with automatic JIRA integration
6. **Update PR description** with AI assistance
7. **Get AI code review** for quality assurance

## Step-by-Step Examples

### Example 1: JIRA Ticket Workflow

Starting with a JIRA ticket `PROJ-123: Implement user authentication`:

```bash
# 1. Create branch from JIRA ticket
git create-branch --jira PROJ-123
# AI generates: feat/PROJ-123-implement-user-auth

# 2. Make your changes
# ... implement authentication features ...
git add .
git commit -m "Add user authentication with JWT"

# 3. Create Pull Request
git open-pr
# Creates PR with title: "[PROJ-123] Implement user authentication"

# 4. Update description with AI (optional)
git update-pr-desc "Focus on security best practices and JWT implementation"

# 5. Get AI review (optional)
git pr-review
```

### Example 2: Git Diff Workflow

When you have uncommitted changes and want to create a branch:

```bash
# 1. Make some changes first
# ... modify files ...

# 2. Create branch based on your changes
git create-branch --git-diff
# AI analyzes your changes and suggests: fix/update-user-validation

# 3. Commit your changes
git add .
git commit -m "Update user validation logic"

# 4. Create Pull Request
git open-pr
# Creates PR with title based on branch name
```

### Example 3: Custom Prompt Workflow

When working on a task without a JIRA ticket:

```bash
# 1. Create branch from description
git create-branch --prompt "Add dark mode support to the application"
# AI generates: feat/add-dark-mode-support

# 2. Implement the feature
# ... add dark mode functionality ...
git add .
git commit -m "Add dark mode toggle and theme switching"

# 3. Create Pull Request
git open-pr
# Creates PR with title: "Add dark mode support"

# 4. Enhance with AI description
git update-pr-desc
```

### Example 4: Branch Renaming Workflow

When you want to rename your current branch:

```bash
# Rename based on JIRA ticket
git create-branch --jira PROJ-456 -m
# Renames to: feat/PROJ-456-optimize-database-queries

# Or rename based on changes
git create-branch --git-diff -m
# Analyzes changes and renames accordingly
```

### Example 5: Plan Issue Workflow

When you want to plan and take on a GitHub/GitLab issue systematically:

```bash
# 1. Plan the issue implementation
git plan-issue --issue 42
# AI analyzes the issue and creates a detailed implementation plan

# 2. Take the issue and create a branch
git take-issue --issue 42

# 3. AI generates appropriate branch name: feat/issue-42-implement-user-dashboard
git create-branch --git-diff

# 4. Implement following the plan
# ... implement the feature according to the plan ...
git add .
git commit -m "Implement user dashboard with filtering and sorting"

# 5. Create Pull Request
git open-pr
# Creates PR with title: "Implement user dashboard (#42)"

# 6. Update description with AI
git update-pr-desc
# AI generates comprehensive PR description based on the original issue and implementation

# 7. Get AI review
git pr-review
# AI reviews the code against the original issue requirements
```
