---
name: fix-pr-comment
description: >
  Fix a PR/MR review comment by fetching its details, applying the code fix,
  committing the change, and replying to the comment. Supports both GitHub and
  GitLab. Use when the user wants to resolve PR/MR review comments — either a
  specific comment URL, or all open comments on the current PR/MR. Triggers on
  phrases like "fix this comment [URL]", "resolve this PR comment", "fix pr
  comment [URL]", "fix this MR comment", "fix all PR comments", "address all
  review comments", or any request to address GitHub PR or GitLab MR review
  comments with or without a link.
---

# Fix PR/MR Comment

## Step 0: Determine mode

**If a comment URL is provided** → go to Step 1 (single-comment mode).

**If no URL is provided** → run the batch script to get all open comments on the current PR/MR:

```bash
python3 .claude/skills/fix-pr-comment/scripts/fetch_pr_comments.py
```

This returns a JSON array of open comment objects. Each object has the same fields as the single-comment output — see the platform reference for field descriptions.

- If the array is empty, tell the user there are no open review comments.
- Otherwise, display a numbered summary of the comments (file, line, first line of body) and confirm with the user which ones to fix (default: all of them).
- Then process each selected comment in sequence using Steps 2–5 below, replacing "Step 1" with the comment data already in hand.

Read the platform-specific reference before proceeding:

- GitHub → `.claude/skills/fix-pr-comment/references/github.md`
- GitLab → `.claude/skills/fix-pr-comment/references/gitlab.md`

---

## Step 1: Detect platform and fetch comment details

Run the helper script with the comment URL:

```bash
python3 .claude/skills/fix-pr-comment/scripts/fetch_comment.py "<comment_url>"
```

The script detects the platform from the URL and returns a JSON object.

**Before continuing, read the platform-specific reference for field descriptions and reply instructions:**

- GitHub → `.claude/skills/fix-pr-comment/references/github.md`
- GitLab → `.claude/skills/fix-pr-comment/references/gitlab.md`

---

## Step 2: Understand and fix the issue

Use the fields from Step 0 or Step 1 (see the platform reference for what each field means):

- **Inline comments** (`path` is set): read the file at `path`, use `body` and diff context for guidance
- **General comments** (`path` is null): understand the issue from `body`, find and fix the relevant code

Apply the minimal change necessary to address the comment.

---

## Step 3: Commit the fix

```bash
git add <changed_files>
git commit -m "fix: <concise description>

Resolves review comment: <comment_url>"
```

If pre-commit hooks modify staged files, re-stage before committing.

When fixing multiple comments in batch mode, you may bundle related fixes into a single commit if it makes sense, or commit after each fix — use your judgment based on how independent the changes are.

---

## Step 4: Push the fix

```bash
git push
```

Capture the commit hash:

```bash
git rev-parse HEAD
```

---

## Step 5: Reply to the comment

Use the reply command from the platform reference (github.md or gitlab.md).

Write a concise reply explaining what was done and reference the commit. Example:

> Fixed in {commit_sha} — added `note?: string` to `SpanOrderItem` to remove the `as any` cast.

In batch mode, reply to each comment individually after its fix is committed and pushed.
