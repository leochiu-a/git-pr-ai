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

- `--issue <number>`: GitHub issue number to plan
- `--jira <key>`: JIRA ticket key to convert to Git platform issue

Note: Provide either `--issue` or `--jira` (not both).

## Modes

- **Optimize**: Improve existing issue content for clarity and actionability
- **Comment**: Provide analysis and solution recommendations
- **JIRA**: Convert JIRA ticket to Git platform issue format

## Features

- **AI-powered enhancement**: Optimize or generate solution commentary
- **Interactive actions**: Replace content / add comment / save to file
- **JIRA integration**: Fetches ticket details and converts to issue
