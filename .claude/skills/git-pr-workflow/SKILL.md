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

## Step 1: Create Branch

```bash
git create-branch --jira <TICKET>
```

Generate branch name from JIRA ticket. AI provides 3 options in commitlint format (e.g., `feat/PROJ-123-add-user-auth`). User selects one.

## Step 2: AI Commit

```bash
git ai-commit --jira
```

After code changes are staged (`git add`), generate AI commit messages with JIRA context. User selects commit type (`feat`, `fix`, etc.), AI provides 3 message options.

## Step 3: Open PR

```bash
git open-pr --no-web
```

Create PR directly in CLI without opening browser. Auto-detects JIRA ticket from branch name, fetches ticket title, generates PR title as `[PROJ-123] ticket title`.

## Step 4: Update PR Description

```bash
git update-pr-desc --yolo
```

AI generates PR description from diff using repo's PR template (or default template). Replaces existing description entirely.

## Step 5: PR Review

```bash
git pr-review --yolo
```

AI reviews the PR diff and posts review comment via GitHub GraphQL API or GitLab discussions API.

## Prerequisites

- `gh` (GitHub) or `glab` (GitLab) CLI installed and authenticated
- JIRA credentials configured: `git pr-ai config --jira`
- AI agent configured: `git pr-ai config --agent`
