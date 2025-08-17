# git update-pr-desc

Update Pull Request description using AI assistance.

## Usage

```bash
# Update PR description with AI
git update-pr-desc

# Update with additional context (use quotes for multiple words)
git update-pr-desc "Focus on performance improvements and add test coverage details"

# Single words don't need quotes
git update-pr-desc performance

# Multiple separate arguments are joined with spaces
git update-pr-desc Add security improvements
```

## Features

- **AI-Powered Descriptions**: Uses Claude or Gemini for intelligent content generation
- **Smart Analysis**: AI analyzes your code changes automatically without manual diff input
- **Platform Agnostic**: Works with both GitHub and GitLab Pull Requests
- **Context Aware**: Understands your repository structure and changes
- **Additional Context**: Accepts custom context as command line arguments
- **PR Template Support**: Automatically detects and uses PR templates if available

## Example Output

```
🔍 Checking for PR on current branch...
🔗 PR URL: https://github.com/owner/repo/pull/123
📋 Target branch: main
🌿 Current branch: feature/PROJ-123-add-login
🤖 Using CLAUDE for AI assistance
📋 Using PR template from: .github/pull_request_template.md
📝 Additional context: Focus on performance improvements and add test coverage details
# Interactive AI session begins...
✅ PR description updated successfully!
```
