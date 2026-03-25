---
name: fix-pr-comment
description: >
  Fix a GitHub PR comment by fetching its details, applying the code fix,
  committing the change, and replying to the comment on GitHub. Use when the
  user provides a GitHub PR comment URL and wants to resolve it automatically.
  Triggers on phrases like "fix this comment [URL]", "resolve this PR comment",
  "fix pr comment [URL]", or any request to address a specific GitHub PR review
  comment with a link.
---

# Fix PR Comment

## Workflow

### Step 1: Fetch comment details

Run the helper script with the comment URL:

```bash
python3 .claude/skills/fix-pr-comment/scripts/fetch_comment.py "<comment_url>"
```

Output JSON fields: `comment_id`, `comment_type` (`"review"` or `"issue"`), `body`, `path`, `line`, `diff_hunk`, `pull_number`, `owner`, `repo`.

### Step 2: Understand and fix the issue

- **Review comments**: read the file at `path`, use `body` + `diff_hunk` for context, apply the fix
- **Issue comments**: understand the issue from `body`, find and fix the relevant code

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

After pushing, capture the commit hash:

```bash
git rev-parse HEAD
```

### Step 5: Reply to the comment

Include the commit hash in the reply so reviewers can navigate directly to the fix.

**Review comment** (`comment_type == "review"`):

```bash
gh api /repos/{owner}/{repo}/pulls/comments \
  --method POST \
  -f body="<reply_text>" \
  -F in_reply_to={comment_id} \
  -F pull_number={pull_number}
```

**Issue/PR-level comment** (`comment_type == "issue"`):

```bash
gh api /repos/{owner}/{repo}/issues/{pull_number}/comments \
  --method POST \
  -f body="<reply_text>"
```

Write a concise reply explaining what was done and reference the commit. Example:

> Fixed in {commit_sha} — added `@storybook/addon-viewport` to `devDependencies` to make the dependency explicit.

## Notes

- If the comment contains a GitHub **code suggestion block**, apply it exactly
