# git update-pr-desc

Update Pull Request description using AI assistance.

## Usage

```bash
# Update PR description with AI
git update-pr-desc

# Update with additional context
git update-pr-desc "Focus on performance improvements and add test coverage details"
```

## Features

- **AI-Powered Descriptions**: Uses Claude Code for intelligent content generation
- **Smart Analysis**: AI analyzes your code changes automatically without manual diff input
- **Platform Agnostic**: Works with both GitHub and GitLab Pull Requests
- **Context Aware**: Understands your repository structure and changes
- **Additional Context**: Accepts custom context for focused descriptions

## Example Output

```
🔍 Checking for PR on current branch...
🔗 PR URL: https://github.com/owner/repo/pull/123
📋 Target branch: main
🌿 Current branch: feature/PROJ-123-add-login
🤖 Using CLAUDE for AI assistance
📝 Additional context: Focus on performance improvements
# Interactive AI session begins...
✅ PR description updated successfully!
```
