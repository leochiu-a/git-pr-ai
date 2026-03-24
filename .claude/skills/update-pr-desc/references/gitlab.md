# GitLab Workflow

## Step 1: Get MR details

```bash
glab mr view --output json
```

## Step 2: Analyze code changes

Examine the diff to understand:
- **Purpose**: What problem does this MR solve?
- **Scope**: What files and functionality are affected?
- **Impact**: How does this change the user/developer experience?
- **Dependencies**: Are there related changes or requirements?

```bash
glab mr diff
```

## Step 3: Find MR template

Check in order:
```
.gitlab/merge_request_templates/default.md
.gitlab/merge_request_templates/Default.md
.gitlab/merge_request_templates/merge_request_template.md
```

- If a template exists: follow its structure, fill in all sections
- If no template: use [default-template.md](default-template.md)

Keep section headings in English, write content in the configured language.

## Step 4: Apply the description

```bash
cat > description.md << 'EOF'
<generated description>
EOF

glab mr update --description "$(cat description.md)"
```

Report success and show the MR URL to the user.
