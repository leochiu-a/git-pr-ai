# git weekly-summary

Generate a weekly summary of git activity and accomplishments.

## Usage

```bash
# Generate weekly summary for current week (both PRs and commits)
git weekly-summary

# Show only Pull Requests for current week
git weekly-summary --pr

# Show only commits for current week
git weekly-summary --commit

# Generate summary for specific date range
git weekly-summary --since 2024-01-01 --until 2024-01-07

# Output to markdown file with full summary
git weekly-summary --md

# Output to specific markdown file
git weekly-summary --md summary.md
```

## Options

| Option            | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| `--pr`            | Include Pull Requests in summary                            |
| `--commit`        | Include commits in summary                                  |
| `--since <date>`  | Start date (YYYY-MM-DD), defaults to Monday of current week |
| `--until <date>`  | End date (YYYY-MM-DD), defaults to today                    |
| `--md [filename]` | Output in Markdown format, optionally specify filename      |
| `--stats`         | Show additional statistics                                  |

## Features

- **Pull Request Analysis**: Shows PRs created, merged, and reviewed
- **Commit Analysis**: Summarizes commits with message categorization
- **Flexible Output**: Console display or markdown file export
- **Statistics**: Optional detailed statistics about activity
- **Date Range Flexibility**: Can generate summaries for any time period
- **Selective Content**: Choose to include PRs only, commits only, or both

## Examples

```bash
# Show both PRs and commits for current week
git weekly-summary

# Show only PRs for current week
git weekly-summary --pr

# Show only commits for current week
git weekly-summary --commit

# Custom date range with statistics
git weekly-summary --since 2024-08-10 --until 2024-08-16 --stats

# Full markdown report (includes everything)
git weekly-summary --md weekly-report.md

# PRs only with statistics to console
git weekly-summary --pr --stats
```
