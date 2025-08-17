# git weekly-summary

Generate a weekly summary of git activity and accomplishments.

## Usage

```bash
# Generate weekly summary for current week
git weekly-summary

# Generate summary for specific date range
git weekly-summary --from 2024-01-01 --to 2024-01-07

# Generate summary with enhanced formatting
git weekly-summary --format detailed
```

## Options

- `--from <date>`: Start date for summary (YYYY-MM-DD format)
- `--to <date>`: End date for summary (YYYY-MM-DD format)
- `--format <type>`: Output format (simple, detailed, markdown)
- `--author <name>`: Filter commits by specific author

## Features

- **Commit Analysis**: Summarizes commits with message categorization
- **File Changes**: Shows files modified, added, and deleted
- **Activity Metrics**: Provides statistics on development activity
- **Multiple Formats**: Supports various output formats for different use cases
- **Date Range Flexibility**: Can generate summaries for any time period

## Examples

```bash
# Current week summary
git weekly-summary
# → Generates summary from Monday to current date

# Specific week with detailed format
git weekly-summary --from 2024-01-01 --to 2024-01-07 --format detailed
# → Creates comprehensive weekly report

# Markdown output for documentation
git weekly-summary --format markdown
# → Outputs summary in markdown format for easy sharing
```
