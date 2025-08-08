# Introduction

Git PR AI Tool is a powerful command-line tool that automates Pull Request creation for GitHub and GitLab with JIRA integration. It streamlines your development workflow by automatically extracting JIRA ticket numbers from branch names and creating well-structured PRs with AI assistance.

## Key Features

- 🔍 **Smart JIRA Integration**: Automatically extracts JIRA ticket numbers from branch names
- 🌿 **AI-Powered Branch Creation**: Create branches using JIRA ticket information with intelligent naming
- 🚀 **Multi-Platform Support**: Works with both GitHub and GitLab Pull Requests
- 🤖 **AI-Enhanced Descriptions**: Update PR descriptions using Claude Code AI assistance
- 🔍 **AI Code Reviews**: Get comprehensive PR reviews with intelligent feedback
- ⚡ **Zero Configuration**: Works out of the box with minimal setup
- 🎯 **Smart Context Analysis**: AI analyzes your code changes without manual diff input

## Quick Start

1. **Install the tool globally:**

   ```bash
   pnpm add -g git-pr-ai
   ```

2. **Create a branch from JIRA ticket:**

   ```bash
   git create-branch --jira PROJ-123
   ```

3. **Create a Pull Request:**

   ```bash
   git open-pr
   ```

4. **Update PR description with AI:**

   ```bash
   git update-pr-desc
   ```

5. **PR review with AI:**

   ```bash
   git pr-review
   ```

That's it! The tool handles the rest automatically.

## How It Works

The Git PR AI Tool integrates seamlessly with your existing Git workflow:

1. **Branch Creation**: Uses JIRA API to fetch ticket information and AI to generate meaningful branch names
2. **PR Creation**: Automatically detects JIRA tickets from branch names and creates PRs with proper titles
3. **AI Enhancement**: Leverages Claude Code for intelligent content generation and code analysis
4. **Platform Integration**: Uses GitHub CLI or GitLab CLI for platform-specific operations
5. **Smart Analysis**: AI analyzes your repository context without requiring manual diff input

## Next Steps

- [Installation Guide](./installation) - Detailed installation and setup instructions
- [Commands Reference](./commands) - Complete list of available commands
- [Configuration](./configuration) - Customize the tool for your needs
