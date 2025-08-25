# git weekly-summary

Generate a weekly summary of git activity and accomplishments.

## Usage

```bash
git weekly-summary [OPTIONS]
```

- **Default**: Shows PRs, commits, and reviews with statistics for current week
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
- **Commit Analysis**: Summarizes commits with message categorization
- **Flexible Output**: Console display or markdown file export
- **Statistics**: Always includes detailed statistics about activity
- **Date Range Flexibility**: Can generate summaries for any time period
- **Complete Coverage**: Always includes PRs, commits, and reviews

## Examples

```bash
# Show PRs, commits, and reviews with statistics for current week
git weekly-summary

# Custom date range
git weekly-summary --since 2024-08-10 --until 2024-08-16

# Full markdown report
git weekly-summary --md weekly-report.md
```
