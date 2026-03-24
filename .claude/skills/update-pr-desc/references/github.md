# GitHub Workflow

## Step 1: Get PR details

```bash
gh pr view --json number,title,url,baseRefName,headRefName,body
```

## Step 2: Analyze code changes

Examine the diff to understand:
- **Purpose**: What problem does this PR solve?
- **Scope**: What files and functionality are affected?
- **Impact**: How does this change the user/developer experience?
- **Dependencies**: Are there related changes or requirements?

```bash
gh pr diff
```

## Step 3: Find PR template

Check in order:
```
.github/pull_request_template.md
.github/PULL_REQUEST_TEMPLATE.md
.github/pull_request_template/default.md
```

- If a template exists: follow its structure, fill in all sections
- If no template: use [default-template.md](default-template.md)

Keep section headings in English, write content in the configured language.

## Step 4: Apply the description

```bash
cat > description.md << 'EOF'
<generated description>
EOF

gh pr edit <PR_NUMBER> --repo <OWNER>/<REPO> --body-file description.md
```

Report success and show the PR URL to the user.
