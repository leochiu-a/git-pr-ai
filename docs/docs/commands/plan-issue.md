# git plan-issue

Smart Issue Planning — analyze GitHub issues and create implementation plans, or convert JIRA tickets to Git platform issues.

## Usage

```bash
# Plan from an existing GitHub issue
git plan-issue --issue 42

# Convert a JIRA ticket to a Git platform issue
git plan-issue --jira PROJ-123
```

## Options

| Option             | Description                                      |
| ------------------ | ------------------------------------------------ |
| `--issue <number>` | GitHub issue number to plan                      |
| `--jira <key>`     | JIRA ticket key to convert to Git platform issue |

Note: Provide either `--issue` or `--jira` (not both).

## Modes

The tool offers three different enhancement modes:

1. **Optimize Mode**: Improve existing issue content for clarity and actionability
   - Enhances issue title and description
   - Adds structured implementation details
   - Interactive option to replace original issue content

2. **Comment Mode**: Provide analysis and solution recommendations
   - Generates comprehensive solution analysis
   - Adds implementation suggestions as comments
   - Preserves original issue content

3. **JIRA Mode**: Convert JIRA ticket to Git platform issue format
   - Fetches JIRA ticket details automatically
   - Converts to GitHub/GitLab issue format
   - Creates properly formatted issue content

## Features

- **AI-powered enhancement**: Uses Claude or Gemini for intelligent content generation
- **Interactive workflow**: Choose between replace content, add comment, or save to file
- **Multi-platform support**: Works with GitHub and GitLab
- **JIRA integration**: Seamlessly converts JIRA tickets to Git platform issues
- **File export**: Save enhanced content to markdown files for later use

## Workflow

1. **Fetch**: Retrieves issue or JIRA ticket details
2. **Analyze**: AI processes content and generates enhancements
3. **Review**: Preview the enhanced content
4. **Action**: Choose to replace, comment, or save to file
