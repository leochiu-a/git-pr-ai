# git weekly-summary

Generate a weekly summary of git activity and accomplishments (PRs and reviews).

## Usage

```bash
git weekly-summary [OPTIONS]
```

- **Default**: Shows PRs and reviews with statistics for current week
- **Date range**: Specify custom period with `--since` and `--until`
- **Output format**: Use `--md` for markdown file export

## Options

| Option            | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| `--since <date>`  | Start date (YYYY-MM-DD), defaults to Monday of current week |
| `--until <date>`  | End date (YYYY-MM-DD), defaults to today                    |
| `--md [filename]` | Output in Markdown format, optionally specify filename      |

## Features

- **Pull Request Analysis**: Shows PRs created, merged, and reviewed
- **PR Review Analysis**: Shows PRs reviewed by the current user
- **Flexible Output**: Console display or markdown file export
- **Statistics**: Always includes detailed statistics about activity
- **Date Range Flexibility**: Can generate summaries for any time period
- **Complete Coverage**: Always includes PRs and reviews

## Examples

```bash
# Show PRs and reviews for current week
git weekly-summary

# Custom date range
git weekly-summary --since 2024-08-10 --until 2024-08-16

# Full markdown report
git weekly-summary --md weekly-report.md

# Auto-generated filename for markdown
git weekly-summary --md
```

## Example Output

```
=== Weekly Summary (2024-08-18 to 2024-08-25) ===

📝 Pull Requests (12):
  acme-corp/web-app (7):
    🟣 #245: feat: add user dashboard (merged)
    🟢 #244: docs: update API documentation (open)
    🟣 #243: fix: resolve authentication bug (merged)
    🟣 #242: refactor: improve code structure (merged)
    🟣 #241: feat: add dark mode support (merged)
    🟣 #240: test: increase test coverage (merged)
    🟣 #239: chore: update dependencies (merged)

  john-doe/personal-project (3):
    🟣 #58: docs: add setup instructions (merged)
    🟣 #57: refactor: clean up codebase (merged)
    🟣 #56: feat: add new feature (merged)

  opensource/library (2):
    🟢 #123: feat: add TypeScript support (open)
    🟣 #122: fix: handle edge cases (merged)

👀 Reviewed PRs (15):
  company/frontend-repo (8):
    • #445: feat: implement search functionality
    • #444: fix: resolve mobile layout issues
    • #443: docs: add component examples
    • #442: test: add unit tests
    • #441: refactor: optimize performance
    • #440: feat: add user preferences
    • #439: fix: handle error states
    • #438: chore: update build process

  company/backend-api (4):
    • #189: feat: add authentication endpoints
    • #188: fix: handle database errors
    • #187: docs: update API documentation
    • #186: test: add integration tests

  team/shared-utils (3):
    • #67: feat: add utility functions
    • #66: fix: resolve type issues
    • #65: docs: improve documentation
```
