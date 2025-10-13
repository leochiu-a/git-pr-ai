# git update-pr-desc

Update Pull Request description using AI assistance.

<iframe width="560" height="315" src="https://www.youtube.com/embed/dtJisR4v5wI?si=Bu3qNU5flvO3L4es" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Usage

```bash
git update-pr-desc [options] [additional context...]
```

- **No arguments**: AI analyzes your changes and generates description
- **With context**: Provide specific focus areas or requirements
- **Quote handling**: Use quotes for multi-word context

## Options

| Option   | Description                                          |
| -------- | ---------------------------------------------------- |
| `--yolo` | Skip confirmation prompts and apply changes directly |

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

# Skip confirmation prompts (YOLO mode)
git update-pr-desc --yolo "Update description automatically"
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
