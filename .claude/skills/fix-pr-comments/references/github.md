# GitHub — Comment Details & Reply

## fetch_comment.py output fields

| Field          | Description                                       |
| -------------- | ------------------------------------------------- |
| `comment_id`   | Numeric ID of the review or issue comment         |
| `comment_type` | `"review"` (inline) or `"issue"` (PR-level)       |
| `body`         | Comment text                                      |
| `path`         | File path (inline only, else null)                |
| `line`         | Line number (inline only, else null)              |
| `diff_hunk`    | Surrounding diff context (inline only, else null) |
| `pull_number`  | PR number                                         |
| `owner`        | Repository owner                                  |
| `repo`         | Repository name                                   |

## Fixing inline vs general comments

- **Inline** (`path` is set): read the file at `path`, use `body` + `diff_hunk` for context
- **General** (`path` is null): understand the issue from `body`, find the relevant code

## Replying

**Review comment** (`comment_type == "review"`):

```bash
gh api /repos/{owner}/{repo}/pulls/{pull_number}/comments \
  --method POST \
  -f body="<reply_text>" \
  -F in_reply_to={comment_id}
```

**Issue/PR-level comment** (`comment_type == "issue"`):

```bash
gh api /repos/{owner}/{repo}/issues/{pull_number}/comments \
  --method POST \
  -f body="<reply_text>"
```

## Notes

- If the comment contains a **code suggestion block**, apply it exactly
- URL fragment format: `#discussion_r{id}` (review) or `#issuecomment-{id}` (issue)
