# GitLab — Comment Details & Reply

## fetch_comment.py output fields

| Field           | Description                                           |
| --------------- | ----------------------------------------------------- |
| `comment_id`    | Numeric note ID                                       |
| `discussion_id` | Discussion thread ID (required for in-thread replies) |
| `comment_type`  | Always `"note"`                                       |
| `body`          | Comment text                                          |
| `path`          | File path (inline only, else null)                    |
| `line`          | Line number (inline only, else null)                  |
| `pull_number`   | MR IID                                                |
| `owner`         | Namespace (user or group)                             |
| `repo`          | Project name                                          |
| `mr_project`    | URL-encoded `namespace%2Frepo` for API calls          |

## Fixing inline vs general comments

- **Inline** (`path` is set): read the file at `path`, use `body` + `line` for context
- **General** (`path` is null): understand the issue from `body`, find the relevant code

## Replying

All GitLab comments are notes inside a discussion thread. Use `discussion_id` to reply in-thread:

```bash
glab api --method POST \
  "projects/{mr_project}/merge_requests/{pull_number}/discussions/{discussion_id}/notes" \
  --field body="<reply_text>"
```

## Notes

- `discussion_id` is returned by `fetch_comment.py`; it is **required** for in-thread replies
- URL fragment format: `#note_{id}` — if the URL has no fragment, ask the user for the full comment URL
