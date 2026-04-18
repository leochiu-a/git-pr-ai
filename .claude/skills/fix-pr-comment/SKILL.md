---
name: fix-pr-comment
description: >
  Fix a PR/MR review comment by fetching its details, applying the code fix,
  committing the change, and replying to the comment. Supports both GitHub and
  GitLab. Use when the user provides a PR/MR comment URL and wants to resolve
  it automatically. Triggers on phrases like "fix this comment [URL]", "resolve
  this PR comment", "fix pr comment [URL]", "fix this MR comment", or any
  request to address a specific GitHub PR or GitLab MR review comment with a
  link.
---

# Fix PR/MR Comment

## Workflow

### Step 1: Detect platform and fetch comment details

Run the helper script with the comment URL:

```bash
python3 .claude/skills/fix-pr-comment/scripts/fetch_comment.py "<comment_url>"
```

The script detects the platform from the URL and returns a JSON object.

**Before continuing, read the platform-specific reference for field descriptions and reply instructions:**

- GitHub → `.claude/skills/fix-pr-comment/references/github.md`
- GitLab → `.claude/skills/fix-pr-comment/references/gitlab.md`

### Step 2: Understand and fix the issue

Use the fields from Step 1 (see the platform reference for what each field means):

- **Inline comments** (`path` is set): read the file at `path`, use `body` and diff context for guidance
- **General comments** (`path` is null): understand the issue from `body`, find and fix the relevant code

Apply the minimal change necessary to address the comment.

### Step 3: Commit the fix

```bash
git add <changed_files>
git commit -m "fix: <concise description>

Resolves review comment: <comment_url>"
```

If pre-commit hooks modify staged files, re-stage before committing.

### Step 4: Push the fix

```bash
git push
```

Capture the commit hash:

```bash
git rev-parse HEAD
```

### Step 5: Reply to the comment

Use the reply command from the platform reference (github.md or gitlab.md).

Write a concise reply explaining what was done and reference the commit. Example:

> Fixed in {commit_sha} — added `note?: string` to `SpanOrderItem` to remove the `as any` cast.
