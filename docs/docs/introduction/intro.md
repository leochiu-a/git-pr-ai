# What is `git-pr-ai`?

Git PR AI Tool is a powerful command-line tool that automates Pull Request creation for GitHub and GitLab with JIRA integration. It streamlines your development workflow by automatically extracting JIRA ticket numbers from branch names and creating well-structured PRs with AI assistance.

## Key Features

- 🚀 **Multi-Platform Support**: Works with both GitHub and GitLab repositories
- 🔍 **JIRA Integration**: Can integrate with JIRA to fetch ticket information
- 🤖 **AI-Powered Intelligence**: Leverages Claude Code and Gemini for smart content generation and code analysis
- 🎯 **Context-Aware Analysis**: Understands your repository without manual input

## Quick Start

**Install the tool globally:**

```bash
pnpm add -g git-pr-ai
```

**Configure AI provider (and optional JIRA integration):**

```bash
# Set up AI provider (defaults to Claude Code, or choose Gemini) and optionally JIRA authentication
git pr-ai config
```

### Available Commands

Each command below can be used independently based on your needs:

**Plan issue implementation:**

```bash
# Generate implementation plan for JIRA ticket
git plan-issue --jira PROJ-123
```

**Take issue and implement plan:**

```bash
# Execute implementation plan
git take-issue --plan-file plan.md
```

**Create a branch from JIRA ticket:**

```bash
# Generates branch name following commitlint conventions
git create-branch --jira PROJ-123
```

**Create a Pull Request:**

```bash
# Automatically fetches JIRA ID and title for PR creation
git open-pr
```

**Update existing PR description with AI:**

```bash
# Enhances your PR description using AI analysis
git update-pr-desc
```

**Get AI-powered PR review:**

```bash
# Provides intelligent code review feedback
git pr-review
```

You can use any of these commands whenever you need them - they're designed to work independently and enhance your existing Git workflow.

## How It Works

The Git PR AI Tool integrates seamlessly with your existing Git workflow:

1. **Create Branch**: `git create-branch --jira PROJ-123` fetches JIRA ticket details and generates an appropriate branch name
2. **Make Changes**: Work on your feature/fix as usual with your standard Git workflow
3. **Open PR**: `git open-pr` automatically creates a pull request with JIRA ticket information and smart titles
4. **Enhance with AI**: `git update-pr-desc` uses AI to analyze your changes and generate comprehensive descriptions
5. **Review & Merge**: `git pr-review` provides AI-powered code review feedback before merging

## Next Steps

- [Installation Guide](./installation) - Detailed installation and setup instructions
- [Commands Reference](../commands) - Complete list of available commands
- [Configuration](../configuration) - Customize the tool for your needs
