# git update-pr-desc

Update Pull Request description using AI assistance.

## Usage

```bash
# Update PR description with AI
git update-pr-desc

# Focus on specific aspects (use quotes for multiple words)
git update-pr-desc "Focus on performance improvements and test coverage"

# Add technical details
git update-pr-desc "Include breaking changes and migration steps"

# Emphasize security considerations
git update-pr-desc "Highlight security implications and authentication changes"

# Request specific formatting
git update-pr-desc "Add detailed examples and usage instructions"

# Single words work without quotes
git update-pr-desc performance
git update-pr-desc documentation
git update-pr-desc testing
```

## Features

- **AI-Powered Descriptions**: Uses Claude or Gemini for intelligent content generation
- **Smart Analysis**: AI analyzes your code changes automatically without manual diff input
- **Platform Agnostic**: Works with both GitHub and GitLab Pull Requests
- **Context Aware**: Understands your repository structure and changes
- **Additional Context**: Accepts custom context as command line arguments
- **PR Template Support**: Automatically detects and uses PR templates if available

## Real-world Examples

Based on actual PRs in this repository:

```bash
# For a weekly summary feature PR
git update-pr-desc "Focus on CLI options and output formats"

# For a refactor/improvement PR
git update-pr-desc "Emphasize code quality improvements and developer experience"

# For a bug fix PR
git update-pr-desc "Detail the issue symptoms and fix approach"

# For documentation updates
git update-pr-desc "Highlight new examples and improved clarity"
```

## Example Output

When you run `git update-pr-desc "Focus on CLI options and output formats"`, the AI might generate a description like this:

> Example for [PR #49](https://github.com/leochiu-a/git-open-pr/pull/49) - feat: add weekly summary command

````markdown
## Summary

This PR introduces a comprehensive weekly summary command that provides developers with detailed insights into their Git activity. The command supports flexible output formats and various filtering options to accommodate different reporting needs.

## Key Features

- **Multiple Output Formats**: Console display or Markdown file export
- **Flexible Time Ranges**: Custom date ranges or default weekly periods
- **Selective Content**: Choose PRs only, commits only, or both
- **Statistics**: Optional detailed metrics about development activity

## CLI Options

| Option            | Description                      |
| ----------------- | -------------------------------- |
| `--pr`            | Include Pull Requests in summary |
| `--commit`        | Include commits in summary       |
| `--since <date>`  | Start date (YYYY-MM-DD)          |
| `--until <date>`  | End date (YYYY-MM-DD)            |
| `--md [filename]` | Output in Markdown format        |
| `--stats`         | Show additional statistics       |

## Usage Examples

```bash
# Show both PRs and commits for current week
git weekly-summary

# Export full report to markdown
git weekly-summary --md weekly-report.md
```
````
