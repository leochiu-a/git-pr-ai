# 🚀 Git PR AI

[![npm version](https://img.shields.io/npm/v/git-pr-ai.svg)](https://www.npmjs.com/package/git-pr-ai)
[![npm downloads](https://img.shields.io/npm/dt/git-pr-ai.svg)](https://www.npmjs.com/package/git-pr-ai)

A CLI tool that empowers developers to create GitHub Pull Requests faster and more efficiently with the help of AI.

---

**[Read the Docs](https://leochiu-a.github.io/git-pr-ai)**

`git-pr-ai` is a command-line tool designed to streamline the process of creating GitHub Pull Requests from JIRA tickets. By leveraging the power of AI, it can automatically generate branch names, PR descriptions, and even assist with code reviews, allowing you to focus on what truly matters: writing high-quality code.

## ✨ Key Features

- **🤖 AI-Powered Intelligence**: Harness Claude Code, Gemini AI, or Cursor Agent to transform mundane git tasks into intelligent, context-aware workflows that understand your code and intentions.
- **🎫 Smart JIRA Integration**: Seamlessly bridge your project management and development workflow with automated branch creation and context extraction from tickets.
- **⚙️ Workflow Revolution**: Replace dozens of repetitive clicks and commands with intuitive, single-command workflows that just work.
- **🚀 Zero-Friction Setup**: From installation to first PR in under 5 minutes - because your time is better spent coding, not configuring tools.

## 📦 Installation

```bash
pnpm add -g git-pr-ai
```

## 📋 Prerequisites

Before you begin, please ensure you have completed the following setup:

- **Platform CLI**: Install and authenticate either GitHub CLI (`gh`) or GitLab CLI (`glab`).
  - GitHub: [Install GitHub CLI](https://cli.github.com/) and run `gh auth login`
  - GitLab: [Install GitLab CLI](https://gitlab.com/gitlab-org/cli) and run `glab auth login`
- **AI Provider**: Depending on your preference, set up access for one of the following AI providers:
  - [Claude Code](https://console.anthropic.com/dashboard) - Anthropic's AI assistant
  - [Gemini CLI](https://ai.google.dev/tutorials/gemini_cli_quickstart) - Google's AI assistant
  - [Cursor Agent CLI](https://docs.cursor.com/agent) - Cursor's AI assistant

### 🔌 Platform & AI Provider Support

| Platform | Claude Code | Gemini CLI | Cursor CLI |
| -------- | :---------: | :--------: | :--------: |
| GitHub   |     ✅      |     ✅     |     ✅     |
| GitLab   |     ✅      |     ✅     |     ✅     |

All combinations of platforms and AI providers are fully supported!

## 🚀 Quick Start

1.  **Configure the tool** (required for git-pr-ai to fetch JIRA data):

    ```bash
    # Set up your preferred AI provider (Claude or Gemini)
    git pr-ai config
    ```

2.  **Create a branch from a JIRA Ticket** 🌿:

    ```bash
    # Automatically generates semantic branch names from JIRA tickets
    git create-branch --jira PROJ-123
    ```

    _No more inconsistent branch names or forgetting ticket details. Just paste your JIRA ID and get perfectly formatted branches every time._

3.  **Create AI-powered Commits** 💬:

    ```bash
    # AI-generated commit messages based on your changes
    git ai-commit
    ```

    _No more generic commit messages. AI analyzes your changes and suggests 3 meaningful commit messages following conventional commit format. Pick the one that fits best!_

4.  **Create a Pull Request** ⚡:

    ```bash
    # One-command PR creation with intelligent title formatting
    git open-pr
    ```

    _Transform your workflow from "commit → switch to browser → fill forms → copy URLs" to just "commit → one command → done!"_

5.  **Update PR Description with AI** 🧠:

    ```bash
    # AI-powered PR descriptions that explain what changed and why
    git update-pr-desc
    ```

    _Never write another boring "fix bug" description. Get detailed, context-aware PR descriptions that help reviewers understand your changes instantly._

6.  **Review PR with AI** 🔍:

    ```bash
    # Instant AI code review with improvement suggestions
    git pr-review
    ```

    _Think of it as having a senior developer review your code 24/7. Catch bugs early, improve code quality, and learn best practices automatically._

7.  **Generate Weekly Summary** 📊:

    ```bash
    # AI-generated weekly summaries for standups and reviews
    git weekly-summary
    ```

    _Stop scrambling to remember what you worked on this week. Get AI-generated summaries that highlight your impact and achievements automatically._

## 📚 Documentation

Want to learn more about detailed configurations and features?

Please refer to our **[full documentation](https://leochiu-a.github.io/git-pr-ai)**.
