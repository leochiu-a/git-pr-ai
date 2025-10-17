# git pr-review

Get AI-powered code review for a Pull Request. An open-source alternative to Cursor Bugbot and Google Code Assist.

<iframe width="560" height="315" src="https://www.youtube.com/embed/IXcranrf9Dw?si=dCgle0ta9JQOseZ-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Usage

```bash
git pr-review [URL] [-c, --context <context>]
```

- **Default**: Reviews PR for current branch
- **URL**: Review specific PR by GitHub/GitLab URL
- **Context**: Provide specific focus areas for review

## Options

| Option                    | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `-c, --context <context>` | Additional context for the review                    |
| `--yolo`                  | Skip confirmation prompts and apply changes directly |

## Features

- **Comprehensive Analysis**: Reviews code changes, structure, and best practices
- **AI-Powered Insights**: Uses Claude or Gemini for intelligent feedback
- **Automatic PR Detection**: Finds PR for current branch or lists available PRs
- **URL Support**: Review specific PRs by GitHub/GitLab URL
- **Additional Context**: Provide specific focus areas for the review
- **Multi-Platform**: Works with both GitHub and GitLab
- **Direct Comments**: Posts review comments directly to the platform

## Examples

```bash
# Review PR for current branch
git pr-review
# → Finds and reviews PR automatically

# Review specific GitHub PR
git pr-review https://github.com/owner/repo/pull/123
# → Reviews the specified PR

# Review with specific focus
git pr-review --context "Focus on security and error handling"
# → Provides targeted review

# Review GitLab MR
git pr-review https://gitlab.com/owner/repo/-/merge_requests/123
# → Reviews the specified GitLab MR

# Skip confirmation prompts (YOLO mode)
git pr-review --yolo --context "Focus on security"
# → Reviews PR and applies feedback directly without confirmation
```

## Example Output

```
🔍 Looking for PR on current branch...
Reviewing PR #123 using CLAUDE...
🔗 PR URL: https://github.com/owner/repo/pull/123
📋 Target branch: main
🌿 Source branch: feature/PROJ-123-add-login
🤖 Launching AI assistant for PR review...
# AI analyzes the PR and provides comprehensive review...
✅ PR review completed and comment posted!
```
