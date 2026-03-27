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
# Split commands to avoid shell parsing errors
glab mr view --format json > /tmp/mr.json
glab repo view --format json > /tmp/repo.json

PROJECT_ID=$(cat /tmp/repo.json | jq -r '.id')
MR_IID=$(cat /tmp/mr.json | jq -r '.iid')
BASE_SHA=$(cat /tmp/mr.json | jq -r '.diff_refs.base_sha')
HEAD_SHA=$(cat /tmp/mr.json | jq -r '.diff_refs.head_sha')
START_SHA=$(cat /tmp/mr.json | jq -r '.diff_refs.start_sha')
```

**Step B - Submit overall review (use --raw-field, NOT --input):**

```bash
glab api --method POST /projects/$PROJECT_ID/merge_requests/$MR_IID/notes \
  --raw-field 'body=## Review Summary

Key points:
- Point 1
- Point 2'
```

**Step C - Submit inline comments (use --raw-field for all fields):**

```bash
glab api --method POST /projects/$PROJECT_ID/merge_requests/$MR_IID/discussions \
  --raw-field 'body=**Issue**

Current:
\`\`\`ts
const x = "value"
\`\`\`

Fix:
\`\`\`ts
const x = '"'"'value'"'"'
\`\`\`' \
  --raw-field 'position[position_type]=text' \
  --raw-field 'position[base_sha]=$BASE_SHA' \
  --raw-field 'position[head_sha]=$HEAD_SHA' \
  --raw-field 'position[start_sha]=$START_SHA' \
  --raw-field 'position[new_path]=src/file.ts' \
  --raw-field 'position[old_path]=src/file.ts' \
  --raw-field 'position[new_line]=15'
```

## Important notes

- MUST use --raw-field (GitLab API requires form fields, not JSON)
- Escape single quotes in bash: '"'"' (e.g., 'Vue'"'"'s' → "Vue's")
- Code blocks: \`\`\` (triple backticks with backslash)
- new_line: line number in new file (after change)
- CRITICAL: Verify line numbers exist in diff before submitting
