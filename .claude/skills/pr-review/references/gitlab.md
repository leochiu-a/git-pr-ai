## GitLab Code Review

Follow [guidelines.md](guidelines.md) for the reviewer role and review guidelines.

## Steps

### 1. Get diff

```bash
glab mr diff
```

### 2. Review the diff

Find issues and write comments per the guidelines above.

### 3. Submit review

**Step A - Get project ID and SHAs:**

```bash
glab mr view --output json > /tmp/mr.json

PROJECT_ID=$(cat /tmp/mr.json | jq -r '.project_id')
MR_IID=$(cat /tmp/mr.json | jq -r '.iid')
BASE_SHA=$(cat /tmp/mr.json | jq -r '.diff_refs.base_sha')
HEAD_SHA=$(cat /tmp/mr.json | jq -r '.diff_refs.head_sha')
START_SHA=$(cat /tmp/mr.json | jq -r '.diff_refs.start_sha')
GITLAB_HOST=$(glab auth status 2>&1 | grep 'Logged in to' | awk '{print $4}')
GITLAB_TOKEN=$(cat ~/.config/glab-cli/config.yml | grep -A5 "$GITLAB_HOST" | grep 'token:' | awk '{print $2}')
```

**Step B - Submit overall review:**

```bash
glab api --method POST /projects/$PROJECT_ID/merge_requests/$MR_IID/notes \
  --raw-field 'body=## Review Summary

Key points:
- Point 1
- Point 2'
```

**Step C - Submit inline comments (MUST use curl + JSON body):**

`glab api --raw-field` does NOT work for nested `position[...]` fields — the server ignores them and position will be null (comment won't anchor to the diff). Always use curl with a JSON body instead.

Single-line comment (anchored to one line):

```bash
curl -s -X POST \
  "https://$GITLAB_HOST/api/v4/projects/$PROJECT_ID/merge_requests/$MR_IID/discussions" \
  -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"body\": \"**Severity — Title**\n\nCurrent:\n\`\`\`ts\nold code here\n\`\`\`\n\nFix:\n\`\`\`ts\nnew code here\n\`\`\`\",
    \"position\": {
      \"base_sha\": \"$BASE_SHA\",
      \"start_sha\": \"$START_SHA\",
      \"head_sha\": \"$HEAD_SHA\",
      \"position_type\": \"text\",
      \"new_path\": \"src/file.ts\",
      \"old_path\": \"src/file.ts\",
      \"new_line\": 15
    }
  }"
```

Multi-line comment (highlights a range of lines):

```bash
# Compute line_code: sha1(filepath)_oldline_newline
# For added lines in new files: old_line = 0
FILE_PATH="src/file.ts"
FILE_HASH=$(echo -n "$FILE_PATH" | sha1sum | cut -d' ' -f1)

curl -s -X POST \
  "https://$GITLAB_HOST/api/v4/projects/$PROJECT_ID/merge_requests/$MR_IID/discussions" \
  -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"body\": \"**Severity — Title**\n\nCurrent:\n\`\`\`ts\nlines 10-12 here\n\`\`\`\n\nFix:\n\`\`\`ts\nnew code here\n\`\`\`\",
    \"position\": {
      \"base_sha\": \"$BASE_SHA\",
      \"start_sha\": \"$START_SHA\",
      \"head_sha\": \"$HEAD_SHA\",
      \"position_type\": \"text\",
      \"new_path\": \"$FILE_PATH\",
      \"old_path\": \"$FILE_PATH\",
      \"new_line\": 12,
      \"line_range\": {
        \"start\": {
          \"line_code\": \"${FILE_HASH}_0_10\",
          \"type\": \"new\"
        },
        \"end\": {
          \"line_code\": \"${FILE_HASH}_0_12\",
          \"type\": \"new\"
        }
      }
    }
  }"
```

## Important notes

- **`glab api --raw-field` vs curl**: Use `glab api --raw-field` only for simple top-level fields (e.g., posting a summary note). For inline comments with `position`, always use curl + JSON body — nested bracket params are silently ignored by the GitLab server.
- **Token**: Read from `~/.config/glab-cli/config.yml` under the correct host section.
- **line_code format**: `sha1(filepath)_oldline_newline`. For added lines (new file or added-only lines), `old_line = 0`.
- **new_line**: Line number in the new file (after the change). For multi-line, set `new_line` to the last line of the range.
- **Verify line numbers**: Always confirm line numbers exist in the diff before submitting.
- **Escape in JSON**: Backticks → `` \` ``, newlines → `\n`, double quotes → `\"`
