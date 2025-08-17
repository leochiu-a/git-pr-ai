# git pr-review

Get AI-powered code review for a Pull Request.

## Usage

```bash
# Review current branch PR
git pr-review

# Review specific PR by URL
git pr-review https://github.com/owner/repo/pull/123

# Review with additional context
git pr-review --context "Focus on security issues"
git pr-review -c "Check for performance problems"
```

## Options

| Option                    | Description                       |
| ------------------------- | --------------------------------- |
| `-c, --context <context>` | Additional context for the review |

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
