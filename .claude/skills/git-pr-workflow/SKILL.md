---
name: git-pr-workflow
description: >
  End-to-end git PR workflow: create branch from JIRA, AI commit with JIRA context, open PR, generate PR description, and AI code review.
  Use when: (1) user wants to start a feature/fix from a JIRA ticket, (2) user says "start workflow", "new feature",
  "take ticket", "full pr flow", (3) user wants to run the complete PR lifecycle from branch creation to code review,
  (4) user mentions any individual step: create branch, commit, open pr, update description, or review pr.
---

# git-pr-workflow

Complete PR lifecycle using git-pr-ai CLI. Run steps sequentially:

## Create Branch

```bash
git create-branch --jira --ci
```

Generate branch name from JIRA ticket in non-interactive CI mode. Auto-selects branch name in commitlint format (e.g., `feat/PROJ-123-add-user-auth`).

## AI Commit

```bash
git ai-commit --ci
```

After code changes are staged (`git add`), generate and auto-apply AI commit message in CI mode (no interactive selection).

## Open PR

```bash
git open-pr --ci
```

Create PR in CI mode without interactive prompts. Auto-detects JIRA ticket from branch name, fetches ticket title, generates PR title as `[PROJ-123] ticket title`.

## Update PR Description

```bash
git update-pr-desc --ci
```

AI generates and auto-applies PR description from diff using repo's PR template (or default template) in CI mode.

## PR Review

```bash
git pr-review --yolo
```

AI reviews the PR diff and posts review comment via GitHub GraphQL API or GitLab discussions API.

## Prerequisites

- `gh` (GitHub) or `glab` (GitLab) CLI installed and authenticated
- JIRA credentials configured: `git pr-ai config --jira`
- AI agent configured: `git pr-ai config --agent`
