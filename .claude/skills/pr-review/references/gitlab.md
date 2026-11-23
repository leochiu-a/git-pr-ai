## GitLab Code Review

Follow [guidelines.md](guidelines.md) for what to flag and how to write comments.

## 1. Set up

```bash
MR=<MR IID or URL>          # empty = current branch's MR
D=<temp dir>/review-mr      # session scratchpad if available, else $(mktemp -d)
mkdir -p "$D/comments" && : > "$D/comments/index.tsv"

glab mr view $MR --output json > "$D/mr.json"

PROJECT_ID=$(jq -r .project_id "$D/mr.json")
MR_IID=$(jq -r .iid "$D/mr.json")
BASE_SHA=$(jq -r .diff_refs.base_sha "$D/mr.json")
HEAD_SHA=$(jq -r .diff_refs.head_sha "$D/mr.json")
START_SHA=$(jq -r .diff_refs.start_sha "$D/mr.json")
MR_AUTHOR=$(jq -r .author.username "$D/mr.json")
CURRENT_USER=$(glab api /user | jq -r .username)
GITLAB_HOST=$(glab auth status 2>&1 | grep 'Logged in to' | awk '{print $4}')
GITLAB_TOKEN=$(grep -A5 "$GITLAB_HOST" ~/.config/glab-cli/config.yml | grep 'token:' | awk '{print $2}')
```

Never echo `GITLAB_TOKEN`.

## 2. Decide whether to review

Stop and tell the user why when `state` is not `opened` or `draft` is true — unless the user explicitly asked to review it anyway.

## 3. Gather context

- Author intent: `title` and `description` in `mr.json`.
- Existing discussions (avoid duplicates): `glab api "/projects/$PROJECT_ID/merge_requests/$MR_IID/discussions?per_page=100"`.
- Files at the head commit (surrounding code, `CLAUDE.md`, `AGENTS.md` at the root and in changed directories):
  `glab api "/projects/$PROJECT_ID/repository/files/$(jq -rn --arg p PATH '$p|@uri')/raw?ref=$HEAD_SHA"`

```bash
glab mr diff $MR_IID --raw > "$D/diff.patch"

# Commentable lines (added/modified, new side)
awk '
  /^diff --git/          { hdr = 1; next }
  hdr && /^\+\+\+ b\//   { file = substr($0, 7); next }
  hdr && /^(---|\+\+\+)/ { next }
  /^@@/                  { hdr = 0; match($0, /\+[0-9]+/); n = substr($0, RSTART + 1, RLENGTH - 1) + 0; next }
  hdr || /^\\/ || /^-/   { next }
                         { if (substr($0, 1, 1) == "+") print file ":" n; n++ }
' "$D/diff.patch" > "$D/commentable.txt"
```

## 4. Review

Find → verify → finalize per the guidelines. Suggestion blocks are GitHub-only in this skill; on GitLab show the fix in a normal code block.

## 5. Write the review as files (no JSON escaping by hand)

- `$D/summary.md` — the overall review summary.
- Per finding: `$D/comments/NN.md` (body) and a line in `$D/comments/index.tsv`: `NN<TAB>path<TAB>start_line<TAB>line` (`-` for a single line).

Check anchors:

```bash
while IFS=$'\t' read -r id file start line; do
  for l in $line ${start#-}; do
    grep -qxF "$file:$l" "$D/commentable.txt" || echo "NOT IN DIFF: $id $file:$l"
  done
done < "$D/comments/index.tsv"
```

Fix or move any `NOT IN DIFF` finding into `summary.md`.

## 6. Submit

Summary note:

```bash
jq -n --rawfile body "$D/summary.md" '{body: $body}' |
  curl -sf -X POST "https://$GITLAB_HOST/api/v4/projects/$PROJECT_ID/merge_requests/$MR_IID/notes" \
    -H "PRIVATE-TOKEN: $GITLAB_TOKEN" -H "Content-Type: application/json" -d @-
```

Inline comments (`glab api --raw-field` silently drops nested `position[...]` fields, so always send a JSON body with curl). For a range, `line_range` uses `line_code = sha1(path)_oldline_newline`, with `old_line = 0` for added lines:

```bash
while IFS=$'\t' read -r id file start line; do
  hash=$(printf '%s' "$file" | shasum | cut -d' ' -f1)
  jq -n --rawfile body "$D/comments/$id.md" --arg path "$file" --arg start "$start" --argjson line "$line" \
    --arg base "$BASE_SHA" --arg head "$HEAD_SHA" --arg startsha "$START_SHA" --arg hash "$hash" '
    {body: $body,
     position: ({position_type: "text", base_sha: $base, head_sha: $head, start_sha: $startsha,
                 new_path: $path, old_path: $path, new_line: $line}
       + (if $start == "-" then {} else
           {line_range: {start: {line_code: "\($hash)_0_\($start)", type: "new"},
                         end:   {line_code: "\($hash)_0_\($line)",  type: "new"}}} end))}' |
  curl -sf -X POST "https://$GITLAB_HOST/api/v4/projects/$PROJECT_ID/merge_requests/$MR_IID/discussions" \
    -H "PRIVATE-TOKEN: $GITLAB_TOKEN" -H "Content-Type: application/json" -d @- >/dev/null \
    || echo "FAILED: $id"
done < "$D/comments/index.tsv"
```

For a renamed file, set `old_path` to the old name. A `FAILED` comment → post its content as a regular note with `path:line` instead.

## 7. Approve when there are no findings

No findings at all → approve without asking. Never approve your own MR, and never approve when any finding was posted.

```bash
if [ ! -s "$D/comments/index.tsv" ] && [ "$MR_AUTHOR" != "$CURRENT_USER" ]; then
  glab mr approve "$MR_IID"
fi
```
