## GitHub Code Review

Follow [guidelines.md](guidelines.md) for what to flag and how to write comments.

Every `gh` command passes `--repo` explicitly, so this works from any directory.

## 1. Set up

```bash
# From a URL https://github.com/OWNER/REPO/pull/N → REPO=OWNER/REPO, N=N
# With no input: N=$(gh pr view --json number -q .number); REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
REPO=OWNER/REPO
N=123
D=<temp dir>/review-$N     # session scratchpad if available, else $(mktemp -d)
mkdir -p "$D/comments" && : > "$D/comments/index.tsv"

gh pr view "$N" --repo "$REPO" \
  --json number,title,body,state,isDraft,author,headRefOid,baseRefName,url > "$D/pr.json"
SHA=$(jq -r .headRefOid "$D/pr.json")
PR_AUTHOR=$(jq -r .author.login "$D/pr.json")
CURRENT_USER=$(gh api user -q .login)
```

## 2. Decide whether to review

Stop and tell the user why when:

- `state` is not `OPEN`, or `isDraft` is true — unless the user explicitly asked to review it anyway.
- You already reviewed this exact head commit:
  ```bash
  gh api "repos/$REPO/pulls/$N/reviews" --paginate \
    -q ".[] | select(.user.login == \"$CURRENT_USER\" and .commit_id == \"$SHA\") | .state"
  ```

## 3. Gather context

```bash
# Changed files with patches (paginated; works for large PRs where `gh pr diff` fails)
gh api "repos/$REPO/pulls/$N/files" --paginate | jq -s add > "$D/files.json"
jq -r '.[] | "\(.status)\t\(.filename)\t+\(.additions)/-\(.deletions)\t\(if .patch then "" else "NO PATCH" end)"' "$D/files.json"

# Existing review comments and conversation (people + bots) — avoid duplicates
gh api "repos/$REPO/pulls/$N/comments" --paginate \
  -q '.[] | "\(.user.login) \(.path):\(.line // .original_line) \(.body | split("\n")[0])"'
gh pr view "$N" --repo "$REPO" --comments

# A file at the head commit (surrounding code, CLAUDE.md, AGENTS.md)
gh api "repos/$REPO/contents/PATH?ref=$SHA" -H "Accept: application/vnd.github.raw"
```

- Repo rules: fetch `CLAUDE.md` and `AGENTS.md` at the root and in each changed file's parent directories (a 404 just means none).
- Files with `NO PATCH` are binary or too large for the API: read them with the contents command if they matter, otherwise list them as not reviewed.
- Skip generated files listed in the guidelines.

Build the list of commentable lines (added/modified lines on the new side):

```bash
jq -r '.[] | select(.patch) | "### \(.filename)\n\(.patch)"' "$D/files.json" | awk '
  /^### /  { file = substr($0, 5); next }
  /^@@/    { match($0, /\+[0-9]+/); n = substr($0, RSTART + 1, RLENGTH - 1) + 0; next }
  /^\\/    { next }
  /^-/     { next }
           { if (substr($0, 1, 1) == "+") print file ":" n; n++ }
' > "$D/commentable.txt"
```

## 4. Review

Read the patches in `files.json`, then find → verify → finalize per the guidelines.

## 5. Write the review as files (no JSON escaping by hand)

- `$D/summary.md` — the overall review summary (markdown).
- For each finding: `$D/comments/NN.md` with the comment body, plus one line in `$D/comments/index.tsv`:
  `NN<TAB>path<TAB>start_line<TAB>line` — use `-` for `start_line` on a single-line comment; otherwise `start_line` must be less than `line`. (Scripts read the path into `$file`, not `$path`: in zsh `path` is tied to `$PATH`.)

A suggestion block in a comment body replaces lines `start_line..line` (or just `line`) with its content:

````markdown
**Important** · High — `items` can be undefined here

`getCart()` returns `undefined` for guests, so this throws on `.length`.

```suggestion
  const count = items?.length ?? 0
```
````

Check every anchor is a commentable line (both ends of a range must be in the same hunk):

```bash
while IFS=$'\t' read -r id file start line; do
  for l in $line ${start#-}; do
    grep -qxF "$file:$l" "$D/commentable.txt" || echo "NOT IN DIFF: $id $file:$l"
  done
done < "$D/comments/index.tsv"
```

Fix or move any `NOT IN DIFF` finding into `summary.md` before submitting.

## 6. Pick the event

- No findings (index.tsv empty) → `APPROVE`, without asking.
- Any finding → `COMMENT`.
- `PR_AUTHOR` equals `CURRENT_USER` → always `COMMENT`. Never approve your own PR.

## 7. Submit

```bash
EVENT=COMMENT   # or APPROVE per step 6

COMMENTS=$(while IFS=$'\t' read -r id file start line; do
  jq -n --rawfile body "$D/comments/$id.md" --arg path "$file" --arg start "$start" --argjson line "$line" \
    '{path: $path, line: $line, side: "RIGHT", body: $body}
     + (if $start == "-" then {} else {start_line: ($start | tonumber), start_side: "RIGHT"} end)'
done < "$D/comments/index.tsv" | jq -s .)

jq -n --arg sha "$SHA" --arg event "$EVENT" --rawfile body "$D/summary.md" --argjson comments "$COMMENTS" \
  '{commit_id: $sha, event: $event, body: $body, comments: $comments}' > "$D/review.json"

gh api --method POST "repos/$REPO/pulls/$N/reviews" --input "$D/review.json" -q .html_url
```

If GitHub answers `422` (e.g. "Line could not be resolved"), the whole review was rejected: move the offending comment's content into `summary.md` (with `path:line`), rebuild `review.json`, and submit again. Report the review URL to the user.
